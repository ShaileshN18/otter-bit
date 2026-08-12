import { WebContainer, FileSystemTree } from "@webcontainer/api";
import { ProjectFile } from "@/lib/projects/projectTypes";

export type TreeNode =
  | {
      name: string;
      type: "folder";
      path: string;
      children: TreeNode[];
    }
  | {
      name: string;
      type: "file";
      path: string;
      visible?: boolean;
      editable?: boolean;
      isTarget?: boolean;
    };

/**
 * Normalizes file paths by trimming whitespace and removing leading slashes.
 */
export function normalizePath(path: string): string {
  let cleaned = path.trim();
  while (cleaned.startsWith("/")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Converts a flat array of ProjectFile objects into WebContainer FileSystemTree format.
 */
export function convertFilesToWebContainerFormat(files: ProjectFile[]): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const file of files) {
    const normalized = normalizePath(file.path);
    const parts = normalized.split("/");
    let currentDir = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        currentDir[part] = {
          file: {
            contents: file.content
          }
        };
      } else {
        if (!currentDir[part]) {
          currentDir[part] = {
            directory: {}
          };
        }
        const dirNode = currentDir[part];
        if ("directory" in dirNode) {
          currentDir = dirNode.directory;
        }
      }
    }
  }

  return tree;
}

/**
 * Recursively builds the TreeNode structure from WebContainer filesystem,
 * filtering nodes so only visible files (and folders containing visible files) are included.
 */
export async function buildTree(
  wc: WebContainer,
  path = "/",
  visiblePaths?: Set<string>,
  targetPaths?: Set<string>
): Promise<TreeNode[]> {
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  const entries = await wc.fs.readdir(normalizedPath, { withFileTypes: true });

  const rawNodes: (TreeNode | null)[] = await Promise.all(
    entries.map(async (entry): Promise<TreeNode | null> => {
      const fullPath = `${normalizedPath}${entry.name}`;
      const cleanFullPath = normalizePath(fullPath);

      if (entry.isDirectory()) {
        const children = await buildTree(wc, fullPath, visiblePaths, targetPaths);
        if (children.length === 0) {
          return null; // Exclude empty folder
        }
        return {
          name: entry.name,
          type: "folder" as const,
          path: fullPath,
          children
        };
      }

      // Check visibility rule if visiblePaths filter set is provided
      if (visiblePaths && !visiblePaths.has(cleanFullPath) && !visiblePaths.has(`/${cleanFullPath}`)) {
        return null; // Exclude hidden file from FileTree
      }

      const isTarget = Boolean(
        targetPaths && (targetPaths.has(cleanFullPath) || targetPaths.has(`/${cleanFullPath}`))
      );

      return {
        name: entry.name,
        type: "file" as const,
        path: fullPath,
        isTarget
      };
    })
  );

  const filtered: TreeNode[] = rawNodes.filter(
    (node): node is TreeNode => node !== null
  );

  return filtered.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    return a.type === "folder" ? -1 : 1;
  });
}
