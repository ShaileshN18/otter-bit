"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TaskSummary {
  id: string;
  title: string;
}

interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  language: string;
  framework: string;
  tasks: TaskSummary[];
}

export default function ProjectsCatalogPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        } else {
          throw new Error(data.error || "Failed to load projects");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects list");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.framework.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#21262d] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Project Catalog
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Select an AI-guided learning project. Each project mounts into an isolated WebContainer environment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">
              {projects.length} Projects Available
            </span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#161b22] p-4 rounded-lg border border-[#21262d]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#21262d]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] text-gray-200 text-xs px-3 py-2 rounded-md border border-[#30363d] focus:border-blue-500 outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading project catalog from MongoDB...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-[#161b22] border border-[#21262d] hover:border-blue-500/60 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {project.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        project.difficulty === "beginner"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : project.difficulty === "intermediate"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {project.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-base font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-[#21262d] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                    <span className="font-mono bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
                      {project.framework}
                    </span>
                    <span>•</span>
                    <span>{project.tasks ? project.tasks.length : 0} Tasks</span>
                  </div>

                  <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Launch →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <p className="text-base">No projects found matching your filter criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Reset search filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
