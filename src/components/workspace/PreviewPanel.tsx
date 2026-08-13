"use client";

import { useState } from "react";

interface PreviewPanelProps {
  previewUrl: string | null;
  onReload?: () => void;
}

export default function PreviewPanel({ previewUrl, onReload }: PreviewPanelProps) {
  const [key, setKey] = useState(0);

  function handleRefresh() {
    setKey((prev) => prev + 1);
    if (onReload) onReload();
  }

  function handleOpenNewWindow() {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#21262d] overflow-hidden select-none font-sans text-xs">
      {/* Top Preview Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#21262d] shrink-0 text-gray-300">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-gray-200 text-xs">Live Preview</span>
          {previewUrl && (
            <span className="text-[11px] font-mono text-gray-400 truncate max-w-[150px] sm:max-w-[250px]">
              {previewUrl}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {previewUrl && (
            <button
              type="button"
              onClick={handleOpenNewWindow}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Launch in New Tab ↗</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload preview iframe"
            className="p-1 rounded hover:bg-[#21262d] text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
        {previewUrl ? (
          <div className="h-full flex flex-col">
            {/* Direct Launch Notice Banner */}
            <div className="bg-[#1c2128] border-b border-[#30363d] px-4 py-2 flex items-center justify-between text-xs text-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">● Server Active</span>
                <span className="text-gray-400 text-[11px]">
                  Browsers block third-party cookies in localhost iframes. Opening in a new tab bypasses all cookie blocks!
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenNewWindow}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                Open Live App ↗
              </button>
            </div>

            {/* Embedded iframe */}
            <div className="flex-1 relative bg-white">
              <iframe
                key={key}
                src={previewUrl}
                title="WebContainer Live Preview"
                className="w-full h-full border-none bg-white"
                allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write;"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#0d1117] text-gray-400 p-6 text-center">
            <div className="space-y-3 max-w-sm">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="font-semibold text-sm text-gray-200">Starting WebContainer Server...</div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Waiting for WebContainer process to start listening on a port. Check the Terminal Logs tab for output.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
