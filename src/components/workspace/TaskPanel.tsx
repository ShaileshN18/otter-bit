"use client";

import { Task } from "@/lib/projects/projectTypes";

interface TaskPanelProps {
  tasks: Task[];
  currentTask: Task | null;
  onSelectTask: (taskId: string) => void;
  onOpenFile: (path: string) => void;
  activeFile?: string;
}

export default function TaskPanel({
  tasks,
  currentTask,
  onSelectTask,
  onOpenFile,
  activeFile
}: TaskPanelProps) {
  if (!currentTask) {
    return (
      <div className="bg-[#121316] text-gray-400 p-4 text-xs font-sans">
        No active task selected.
      </div>
    );
  }

  const currentIndex = tasks.findIndex((t) => t.id === currentTask.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < tasks.length - 1;

  return (
    <div className="bg-[#0d1117] border-b border-[#21262d] text-gray-200 p-4 font-sans text-xs flex flex-col gap-3">
      {/* Header & Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold text-[11px]">
            Task {currentIndex + 1} of {tasks.length}
          </span>
          <h2 className="font-semibold text-sm text-gray-100 truncate">
            {currentTask.title}
          </h2>
        </div>

        {/* Task Navigation buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => hasPrev && onSelectTask(tasks[currentIndex - 1].id)}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              hasPrev
                ? "bg-[#21262d] hover:bg-gray-700 text-gray-200 cursor-pointer"
                : "bg-[#161b22] text-gray-600 cursor-not-allowed"
            }`}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => hasNext && onSelectTask(tasks[currentIndex + 1].id)}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              hasNext
                ? "bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer"
                : "bg-[#161b22] text-gray-600 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Task Description */}
      <p className="text-gray-300 leading-relaxed text-xs">
        {currentTask.description}
      </p>

      {/* Learning Goal Callout */}
      <div className="bg-[#161b22] border-l-2 border-amber-500 p-2.5 rounded-r">
        <div className="font-semibold text-[11px] text-amber-400 uppercase tracking-wide mb-1">
          Learning Goal
        </div>
        <div className="text-gray-300 text-xs">{currentTask.goal}</div>
      </div>

      {/* Target Files List */}
      {currentTask.targetFiles && currentTask.targetFiles.length > 0 && (
        <div className="space-y-1.5">
          <div className="font-semibold text-[10px] uppercase tracking-wider text-gray-400">
            Target Files for this Task
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentTask.targetFiles.map((targetPath) => {
              const isActive = activeFile === targetPath || activeFile === `/${targetPath}`;
              return (
                <button
                  key={targetPath}
                  type="button"
                  onClick={() => onOpenFile(targetPath)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-sm"
                      : "bg-[#161b22] border-[#30363d] text-gray-300 hover:border-gray-500 hover:text-white"
                  }`}
                >
                  <span className="text-blue-400">🎯</span>
                  <span>{targetPath}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Evaluation Criteria */}
      {currentTask.evaluationCriteria && currentTask.evaluationCriteria.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-[10px] uppercase tracking-wider text-gray-400">
            Evaluation Criteria
          </div>
          <ul className="space-y-1 list-disc list-inside text-gray-400 text-xs">
            {currentTask.evaluationCriteria.map((criterion, idx) => (
              <li key={idx} className="leading-snug">
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
