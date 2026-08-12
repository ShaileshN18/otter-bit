import { connectToDatabase } from "@/lib/db";
import Project, { IProjectDocument } from "@/models/Project";
import { ProjectData, ProjectFile, Task } from "@/lib/projects/projectTypes";
import { convertFilesToWebContainerFormat, normalizePath } from "@/lib/filesystem";
import { FileSystemTree } from "@webcontainer/api";

export interface LoadedProject {
  project: ProjectData;
  webcontainerTree: FileSystemTree;
  visiblePaths: string[];
  editablePaths: string[];
}

/**
 * Validates project structure according to platform integrity constraints.
 */
export function validateProjectData(data: ProjectData): void {
  if (!data.id || typeof data.id !== "string") {
    throw new Error("Project validation error: Missing or invalid project id");
  }

  if (!data.tasks || data.tasks.length === 0) {
    throw new Error(`Project validation error (${data.id}): Project must contain at least one task`);
  }

  if (!data.files || data.files.length === 0) {
    throw new Error(`Project validation error (${data.id}): Project must contain at least one file`);
  }

  // Validate unique task IDs and valid task ordering
  const taskIds = new Set<string>();
  for (const task of data.tasks) {
    if (!task.id) {
      throw new Error(`Project validation error (${data.id}): Task missing required id`);
    }
    if (taskIds.has(task.id)) {
      throw new Error(`Project validation error (${data.id}): Duplicate task id "${task.id}"`);
    }
    taskIds.add(task.id);
  }

  // Validate unique file paths
  const filePaths = new Set<string>();
  for (const file of data.files) {
    if (!file.path) {
      throw new Error(`Project validation error (${data.id}): File missing required path`);
    }
    const cleanPath = normalizePath(file.path);
    if (filePaths.has(cleanPath)) {
      throw new Error(`Project validation error (${data.id}): Duplicate file path "${file.path}"`);
    }
    filePaths.add(cleanPath);
  }

  // Validate that targetFiles in each task reference existing files in the project
  for (const task of data.tasks) {
    for (const targetFile of task.targetFiles) {
      const cleanTarget = normalizePath(targetFile);
      if (!filePaths.has(cleanTarget)) {
        throw new Error(
          `Project validation error (${data.id}): Task "${task.id}" references non-existent targetFile "${targetFile}"`
        );
      }
    }
  }
}

/**
 * Loads project document from MongoDB, validates integrity, and prepares WebContainer filesystem tree.
 */
export async function getProject(projectIdOrSlug: string): Promise<LoadedProject> {
  await connectToDatabase();

  const doc = await Project.findOne({
    $or: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }]
  }).lean<IProjectDocument>();

  if (!doc) {
    throw new Error(`Project not found with identifier: "${projectIdOrSlug}"`);
  }

  // Convert Mongoose BSON document to clean JSON
  const rawData = JSON.parse(JSON.stringify(doc)) as ProjectData;

  // Normalize all file paths
  const normalizedFiles: ProjectFile[] = rawData.files.map((file) => ({
    ...file,
    path: normalizePath(file.path)
  }));

  const normalizedTasks: Task[] = rawData.tasks.map((task) => ({
    ...task,
    targetFiles: task.targetFiles.map(normalizePath)
  }));

  const projectData: ProjectData = {
    ...rawData,
    files: normalizedFiles,
    tasks: normalizedTasks
  };

  // Validate project data integrity
  validateProjectData(projectData);

  // Build WebContainer mount format
  const webcontainerTree = convertFilesToWebContainerFormat(projectData.files);

  const visiblePaths = projectData.files
    .filter((f) => f.visible)
    .map((f) => f.path);

  const editablePaths = projectData.files
    .filter((f) => f.editable)
    .map((f) => f.path);

  return {
    project: projectData,
    webcontainerTree,
    visiblePaths,
    editablePaths
  };
}
