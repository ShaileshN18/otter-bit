"use client";

import { useState } from "react";
import { TreeNode } from "@/lib/filesystem";

interface FileTreeProps {
  nodes: TreeNode[];
  activeFile?: string;
  targetFiles?: string[];
  onFileClick: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  className?: string;
}

interface CreatingState {
  parentPath: string;
  type: "file" | "folder";
}

// Custom SVGs for File and Folder icons
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 shrink-0 ${
        isOpen ? "rotate-90" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();

  if (ext === "js" || ext === "jsx") {
    return (
      <span className="text-yellow-400 text-xs font-bold shrink-0 w-4 text-center">
        JS
      </span>
    );
  }
  if (ext === "ts" || ext === "tsx") {
    return (
      <span className="text-blue-400 text-xs font-bold shrink-0 w-4 text-center">
        TS
      </span>
    );
  }
  if (ext === "css") {
    return (
      <span className="text-sky-400 text-xs font-bold shrink-0 w-4 text-center">
        #
      </span>
    );
  }
  if (ext === "json") {
    return (
      <span className="text-amber-500 text-xs font-bold shrink-0 w-4 text-center">
        {"{}"}
      </span>
    );
  }
  if (ext === "html") {
    return (
      <span className="text-orange-500 text-xs font-bold shrink-0 w-4 text-center">
        {"<>"}
      </span>
    );
  }
  if (ext === "md") {
    return (
      <span className="text-purple-400 text-xs font-bold shrink-0 w-4 text-center">
        M↓
      </span>
    );
  }

  return (
    <svg
      className="w-4 h-4 text-gray-400 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 ${
        isOpen ? "text-amber-400" : "text-amber-500"
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      {isOpen ? (
        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a2 2 0 00-2 2v5H4a2 2 0 01-2-2V6z" />
      ) : (
        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      )}
    </svg>
  );
}

export default function FileTree({
  nodes,
  activeFile,
  targetFiles = [],
  onFileClick,
  onCreateFile,
  onCreateFolder,
  className = ""
}: FileTreeProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState<CreatingState | null>(null);
  const [newItemName, setNewItemName] = useState("");

  function toggleFolder(path: string) {
    setOpenFolders((prev) => ({
      ...prev,
      [path]: prev[path] === undefined ? false : !prev[path]
    }));
  }

  function isFolderOpen(path: string) {
    return openFolders[path] !== false;
  }

  function startCreating(parentPath: string, type: "file" | "folder") {
    if (parentPath !== "/") {
      setOpenFolders((prev) => ({ ...prev, [parentPath]: true }));
    }
    setCreating({ parentPath, type });
    setNewItemName("");
  }

  function submitNewItem() {
    if (!creating || !newItemName.trim()) {
      setCreating(null);
      setNewItemName("");
      return;
    }

    const trimmed = newItemName.trim();
    if (creating.type === "file" && onCreateFile) {
      onCreateFile(creating.parentPath, trimmed);
    } else if (creating.type === "folder" && onCreateFolder) {
      onCreateFolder(creating.parentPath, trimmed);
    }

    setCreating(null);
    setNewItemName("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      submitNewItem();
    } else if (e.key === "Escape") {
      setCreating(null);
      setNewItemName("");
    }
  }

  function isTargetFile(path: string, nodeIsTarget?: boolean): boolean {
    if (nodeIsTarget) return true;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return targetFiles.some(
      (tf) => tf === path || tf === cleanPath || tf === `/${cleanPath}`
    );
  }

  function renderInlineInput(parentPath: string) {
    if (creating?.parentPath !== parentPath) return null;

    return (
      <div className="flex items-center gap-1.5 py-1 px-2 my-0.5 rounded bg-[#1e232a] border border-blue-500/50 shadow-sm animate-fadeIn">
        {creating.type === "file" ? (
          <FileTypeIcon name={newItemName || "file"} />
        ) : (
          <FolderIcon isOpen={false} />
        )}
        <input
          type="text"
          autoFocus
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={submitNewItem}
          placeholder={creating.type === "file" ? "file_name.js" : "folder_name"}
          className="w-full bg-[#0d1117] text-gray-100 text-xs px-1.5 py-0.5 rounded border border-gray-700 outline-none focus:border-blue-400"
        />
      </div>
    );
  }

  function renderTree(treeNodes: TreeNode[], depth = 0) {
    return (
      <div className="space-y-0.5">
        {treeNodes.map((node) => {
          if (node.type === "folder") {
            const isOpen = isFolderOpen(node.path);

            return (
              <div key={node.path} className="group/folder">
                <div
                  onClick={() => toggleFolder(node.path)}
                  className="flex items-center justify-between px-2 py-1 rounded text-xs text-gray-300 hover:bg-[#21262d] hover:text-gray-100 cursor-pointer transition-colors group"
                  style={{ paddingLeft: `${Math.max(depth * 12 + 8, 8)}px` }}
                >
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <ChevronIcon isOpen={isOpen} />
                    <FolderIcon isOpen={isOpen} />
                    <span className="truncate font-medium">{node.name}</span>
                  </div>

                  <div className="opacity-0 group-hover/folder:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      type="button"
                      title="New File in folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCreating(node.path, "file");
                      }}
                      className="p-0.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="New Folder in folder"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCreating(node.path, "folder");
                      }}
                      className="p-0.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="ml-2 pl-1 border-l border-gray-800/60 my-0.5">
                    {renderTree(node.children, depth + 1)}
                    {renderInlineInput(node.path)}
                  </div>
                )}
              </div>
            );
          }

          const isActive = activeFile === node.path || (activeFile && activeFile.slice(1) === node.path);
          const isTarget = isTargetFile(node.path, node.isTarget);

          return (
            <div
              key={node.path}
              onClick={() => onFileClick(node.path)}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-all duration-150 relative ${
                isActive
                  ? "bg-[#1f242c] text-blue-400 font-semibold shadow-sm border-l-2 border-blue-500 pl-2"
                  : isTarget
                  ? "bg-[#1c1f26] text-amber-300 font-medium hover:bg-[#222731]"
                  : "text-gray-300 hover:bg-[#161b22] hover:text-gray-100"
              }`}
              style={{ paddingLeft: `${Math.max(depth * 12 + 16, 16)}px` }}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <FileTypeIcon name={node.name} />
                <span className="truncate">{node.name}</span>
              </div>

              {isTarget && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded shrink-0 font-sans">
                  Target
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0d1117] border-r border-[#21262d] text-gray-200 h-full flex flex-col select-none font-sans text-xs ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#21262d] bg-[#161b22]/50">
        <span className="font-semibold tracking-wider text-[10px] text-gray-400 uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => startCreating("/", "file")}
            title="New File in root"
            className="p-1 rounded hover:bg-[#21262d] text-gray-400 hover:text-gray-100 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px]">File</span>
          </button>
          <button
            type="button"
            onClick={() => startCreating("/", "folder")}
            title="New Folder in root"
            className="p-1 rounded hover:bg-[#21262d] text-gray-400 hover:text-gray-100 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-[10px]">Folder</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
        {renderTree(nodes)}
        {renderInlineInput("/")}
      </div>
    </div>
  );
}
