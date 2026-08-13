"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { getWebContainer } from "@/lib/webcontainer";
import { buildTree, TreeNode, normalizePath } from "@/lib/filesystem";
import { ProjectData, Task, ProjectFile } from "@/lib/projects/projectTypes";
import { LoadedProject } from "@/lib/projects/projectLoader";

export type WorkspaceTab = "editor" | "preview" | "terminal" | "split";

export function useWorkspace(projectId: string = "trello-react-tribute") {
  const [wc, setWc] = useState<WebContainer | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loadedData, setLoadedData] = useState<LoadedProject | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live Preview & Terminal Output State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string>("");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("split");

  const processRef = useRef<WebContainerProcess | null>(null);

  // Helper to check if file is editable in project metadata
  const checkIsEditable = useCallback((path: string, files: ProjectFile[]) => {
    const cleanPath = normalizePath(path);
    const fileDef = files.find((f) => normalizePath(f.path) === cleanPath);
    return fileDef ? fileDef.editable : true;
  }, []);

  // Helper to rebuild tree with current project visible files & target files
  const refreshTree = useCallback(
    async (container: WebContainer, visiblePathsList: string[], targetFilesList: string[]) => {
      const visibleSet = new Set(visiblePathsList.map(normalizePath));
      const targetSet = new Set(targetFilesList.map(normalizePath));
      const fileTree = await buildTree(container, "/", visibleSet, targetSet);
      setTree(fileTree);
    },
    []
  );

  // Safely stop existing running process
  const killCurrentProcess = useCallback(() => {
    if (processRef.current) {
      try {
        processRef.current.kill();
      } catch (e) {
        console.warn("Error killing previous WebContainer process:", e);
      }
      processRef.current = null;
    }
  }, []);

  // Launch project process in WebContainer and capture logs/server-ready
  const launchProjectProcess = useCallback(
    async (container: WebContainer, files: ProjectFile[]) => {
      killCurrentProcess();
      setPreviewUrl(null);
      setTerminalLogs((prev) => prev + "\n[System] Starting project server in WebContainer...\n");

      // Register server-ready listener
      container.on("server-ready", (port, url) => {
        setPreviewUrl(url);
        setTerminalLogs((prev) => prev + `\n[System] Server ready on port ${port} -> ${url}\n`);
      });

      // Determine entrypoint script
      const paths = files.map((f) => normalizePath(f.path));
      let entryScript = "";

      if (paths.includes("src/server.js")) {
        entryScript = "src/server.js";
      } else if (paths.includes("server.js")) {
        entryScript = "server.js";
      } else if (paths.includes("src/index.js") || paths.includes("src/App.js") || paths.includes("public/index.html")) {
        // Mount a lightweight static HTTP dev server for frontend previews
        const devServerCode = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'public/index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'public/index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(\`Dev Server listening on port \${PORT}\`);
});
`;
        try {
          await container.fs.writeFile("__dev_server.js", devServerCode);
          entryScript = "__dev_server.js";
        } catch {
          entryScript = "";
        }
      }

      if (!entryScript) return;

      try {
        const proc = await container.spawn("node", [entryScript]);
        processRef.current = proc;

        proc.output.pipeTo(
          new WritableStream({
            write(data) {
              setTerminalLogs((prev) => prev + data);
            }
          })
        );
      } catch (err: any) {
        console.error("Failed to spawn process:", err);
        setTerminalLogs((prev) => prev + `\n[Error] Failed to spawn node process: ${err.message}\n`);
      }
    },
    [killCurrentProcess]
  );

  // Load project from API & mount into WebContainer
  useEffect(() => {
    async function loadWorkspace() {
      try {
        setIsLoading(true);
        setError(null);
        setTerminalLogs("");

        // Fetch project from API
        const res = await fetch(`/api/projects/${projectId}`);
        const responseData = await res.json();

        if (!res.ok || !responseData.success) {
          throw new Error(responseData.error || "Failed to load project from database");
        }

        const projectPayload: LoadedProject = responseData.data;
        const projectData = projectPayload.project;

        setProject(projectData);
        setLoadedData(projectPayload);

        // Initial task
        const initialTask = projectData.tasks[0] || null;
        setCurrentTask(initialTask);

        // Boot WebContainer & mount complete filesystem
        const container = await getWebContainer();
        await container.mount(projectPayload.webcontainerTree);
        setWc(container);

        // Target files for current task
        const targetFiles = initialTask?.targetFiles || [];

        // Build visible FileTree
        await refreshTree(container, projectPayload.visiblePaths, targetFiles);

        // Launch server process
        await launchProjectProcess(container, projectData.files);

        // Select initial file (prefer first target file if visible, else first visible file)
        let initialFilePath = targetFiles.find((tf) => projectPayload.visiblePaths.includes(tf));
        if (!initialFilePath && projectPayload.visiblePaths.length > 0) {
          initialFilePath = projectPayload.visiblePaths[0];
        }

        if (initialFilePath) {
          const cleanPath = normalizePath(initialFilePath);
          const fullPath = `/${cleanPath}`;
          try {
            const initialCode = await container.fs.readFile(fullPath, "utf-8");
            setActiveFile(fullPath);
            setCode(initialCode);
            setIsEditable(checkIsEditable(cleanPath, projectData.files));
          } catch {
            setActiveFile(fullPath);
            setCode("");
          }
        }
      } catch (err: any) {
        console.error("Workspace initialization error:", err);
        setError(err.message || "Failed to initialize project workspace");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspace();

    return () => {
      killCurrentProcess();
    };
  }, [projectId, checkIsEditable, refreshTree, launchProjectProcess, killCurrentProcess]);

  // Open file handler
  async function handleFileClick(path: string) {
    if (!wc) return;
    const cleanPath = normalizePath(path);
    const fullPath = path.startsWith("/") ? path : `/${path}`;

    try {
      const content = await wc.fs.readFile(fullPath, "utf-8");
      setActiveFile(fullPath);
      setCode(content);
      if (project) {
        setIsEditable(checkIsEditable(cleanPath, project.files));
      }
    } catch (err) {
      console.error(`Failed to read file at ${fullPath}:`, err);
    }
  }

  // Code edit handler
  async function handleCodeChange(value: string | undefined) {
    const newCode = value || "";
    setCode(newCode);

    if (wc && activeFile && isEditable) {
      try {
        await wc.fs.writeFile(activeFile, newCode);
      } catch (err) {
        console.error(`Failed to write file at ${activeFile}:`, err);
      }
    }
  }

  // Create file handler
  async function handleCreateFile(parentPath: string, name: string) {
    if (!wc || !loadedData) return;
    const fullPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
    const cleanPath = normalizePath(fullPath);

    try {
      await wc.fs.writeFile(fullPath, "");
      const updatedVisible = [...loadedData.visiblePaths, cleanPath];
      setLoadedData((prev) => (prev ? { ...prev, visiblePaths: updatedVisible } : null));

      const targetFiles = currentTask?.targetFiles || [];
      await refreshTree(wc, updatedVisible, targetFiles);
      setActiveFile(fullPath);
      setCode("");
      setIsEditable(true);
    } catch (err) {
      console.error(`Failed to create file at ${fullPath}:`, err);
    }
  }

  // Create folder handler
  async function handleCreateFolder(parentPath: string, name: string) {
    if (!wc || !loadedData) return;
    const fullPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
    try {
      await wc.fs.mkdir(fullPath);
      const targetFiles = currentTask?.targetFiles || [];
      await refreshTree(wc, loadedData.visiblePaths, targetFiles);
    } catch (err) {
      console.error(`Failed to create folder at ${fullPath}:`, err);
    }
  }

  // Switch active task without remounting WebContainer
  async function switchTask(taskId: string) {
    if (!project || !wc || !loadedData) return;

    const newTargetTask = project.tasks.find((t) => t.id === taskId);
    if (!newTargetTask) return;

    setCurrentTask(newTargetTask);

    const targetFiles = newTargetTask.targetFiles || [];
    await refreshTree(wc, loadedData.visiblePaths, targetFiles);

    if (targetFiles.length > 0) {
      const firstTarget = targetFiles[0];
      const fullPath = firstTarget.startsWith("/") ? firstTarget : `/${firstTarget}`;
      try {
        const fileContent = await wc.fs.readFile(fullPath, "utf-8");
        setActiveFile(fullPath);
        setCode(fileContent);
        setIsEditable(checkIsEditable(firstTarget, project.files));
      } catch {
        // File may not exist yet
      }
    }
  }

  // Reset project back to initial state
  async function resetProject() {
    if (!wc || !loadedData || !project) return;
    try {
      killCurrentProcess();
      await wc.mount(loadedData.webcontainerTree);
      const targetFiles = currentTask?.targetFiles || [];
      await refreshTree(wc, loadedData.visiblePaths, targetFiles);
      await launchProjectProcess(wc, project.files);

      if (activeFile) {
        const content = await wc.fs.readFile(activeFile, "utf-8");
        setCode(content);
      }
    } catch (err) {
      console.error("Failed to reset project:", err);
    }
  }

  function clearTerminalLogs() {
    setTerminalLogs("");
  }

  return {
    wc,
    project,
    currentTask,
    activeFile,
    code,
    tree,
    isLoading,
    isEditable,
    error,
    previewUrl,
    terminalLogs,
    activeTab,
    setActiveTab,
    clearTerminalLogs,
    handleFileClick,
    handleCodeChange,
    handleCreateFile,
    handleCreateFolder,
    switchTask,
    resetProject
  };
}
