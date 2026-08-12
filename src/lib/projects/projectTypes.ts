export interface Task {
  id: string;
  order: number;
  title: string;
  description: string;
  goal: string;
  targetFiles: string[];
  evaluationCriteria: string[];
  status?: "not-started" | "in-progress" | "completed";
}

export interface ProjectFile {
  path: string;
  content: string;
  type: string;
  visible: boolean;
  editable: boolean;
  targetTasks?: string[];
  description?: string;
}

export interface ProjectMetadata {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  language: string;
  framework: string;
  version: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectData extends ProjectMetadata {
  tasks: Task[];
  files: ProjectFile[];
}
