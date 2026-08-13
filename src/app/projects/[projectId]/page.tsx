"use client";

import { use } from "react";
import Workspace from "@/components/Workspace";

export default function ProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return <Workspace projectId={projectId} />;
}
