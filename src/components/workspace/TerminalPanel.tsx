"use client";

import { useEffect, useRef } from "react";

interface TerminalPanelProps {
  logs: string;
  onClear?: () => void;
}

export default function TerminalPanel({ logs, onClear }: TerminalPanelProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#21262d] overflow-hidden select-none font-mono text-xs">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#21262d] shrink-0 font-sans text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono">$&gt;</span>
          <span className="font-semibold text-gray-200">Terminal Output</span>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-0.5 rounded hover:bg-[#21262d] text-gray-400 hover:text-white transition-colors text-[11px]"
          >
            Clear Console
          </button>
        )}
      </div>

      {/* Console Logs Display */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed text-gray-300 whitespace-pre-wrap select-text custom-scrollbar">
        {logs ? (
          <div>
            {logs}
            <div ref={terminalEndRef} />
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Console log output stream is ready...
          </div>
        )}
      </div>
    </div>
  );
}
