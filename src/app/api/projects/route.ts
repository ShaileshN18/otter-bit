import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/Project";

export async function GET() {
  try {
    await connectToDatabase();
    // Return list of available projects (metadata and tasks preview)
    const projects = await Project.find({})
      .select("id title slug description difficulty category language framework version tasks")
      .lean();

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
