"use client";

import Link from "next/link";
import { useWorkspace, WorkspaceTab } from "@/hooks/useWorkspace";
import FileTree from "@/components/FileTree";
import CodeEditor from "@/components/CodeEditor";
import TaskPanel from "@/components/workspace/TaskPanel";
import PreviewPanel from "@/components/workspace/PreviewPanel";
import TerminalPanel from "@/components/workspace/TerminalPanel";

interface WorkspaceProps {
  projectId?: string;
}

export default function Workspace({ projectId = "trello-react-tribute" }: WorkspaceProps) {
  const {
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
  } = useWorkspace(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-gray-400 font-sans text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Booting WebContainer & starting live project server...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117] text-gray-400 font-sans text-sm p-6">
        <div className="bg-[#161b22] border border-red-500/30 p-6 rounded-lg max-w-md space-y-3">
          <h2 className="text-red-400 font-semibold text-base">Failed to Load Project</h2>
          <p className="text-xs text-gray-300">{error || "Project data could not be found."}</p>
          <Link
            href="/projects"
            className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors"
          >
            Return to Projects Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden select-none">
      {/* Top Project Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#21262d] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-sans transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Projects</span>
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <h1 className="font-bold text-sm text-gray-100">{project.title}</h1>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {project.category}
          </span>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {project.framework} ({project.language})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetProject}
            title="Reset files to initial state"
            className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-gray-700 text-gray-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Reset Workspace
          </button>
        </div>
      </div>

      {/* Task Curriculum Panel */}
      <TaskPanel
        tasks={project.tasks}
        currentTask={currentTask}
        onSelectTask={switchTask}
        onOpenFile={handleFileClick}
        activeFile={activeFile}
      />

      {/* Main Workspace Workspace Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 h-full flex-shrink-0">
          <FileTree
            nodes={tree}
            activeFile={activeFile}
            targetFiles={currentTask?.targetFiles}
            onFileClick={handleFileClick}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
          />
        </div>

        {/* Center/Right Content Area with View Tabs */}
        <div className="flex-1 h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Main Area View Tabs Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b border-[#2d2d2d] shrink-0 text-xs font-sans">
            {/* View Mode Tab Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "split"
                    ? "bg-[#21262d] text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📑 Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "editor"
                    ? "bg-[#21262d] text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                📝 Code Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-[#21262d] text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span>🌐 Live Preview</span>
                {previewUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-[#21262d] text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                💻 Terminal Logs
              </button>
            </div>

            {/* Active File Label */}
            {activeFile && (
              <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                <span className="text-blue-400">📄</span>
                <span>{activeFile}</span>
                {!isEditable && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-sans">
                    Read Only
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 h-full overflow-hidden">
            {activeTab === "split" && (
              <div className="grid grid-cols-2 h-full w-full">
                <div className="h-full border-r border-[#2d2d2d] overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    readOnly={!isEditable}
                  />
                </div>
                <div className="h-full overflow-hidden">
                  <PreviewPanel previewUrl={previewUrl} />
                </div>
              </div>
            )}

            {activeTab === "editor" && (
              <div className="h-full">
                <CodeEditor
                  code={code}
                  onChange={handleCodeChange}
                  readOnly={!isEditable}
                />
              </div>
            )}

            {activeTab === "preview" && (
              <div className="h-full">
                <PreviewPanel previewUrl={previewUrl} />
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="h-full">
                <TerminalPanel logs={terminalLogs} onClear={clearTerminalLogs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
