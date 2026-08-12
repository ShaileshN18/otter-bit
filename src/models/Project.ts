import mongoose, { Schema, Document } from "mongoose";
import { ProjectData } from "@/lib/projects/projectTypes";

const TaskSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: String, required: true },
    targetFiles: { type: [String], default: [] },
    evaluationCriteria: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started"
    }
  },
  { _id: false }
);

const FileSchema = new Schema(
  {
    path: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, required: true },
    visible: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
    targetTasks: { type: [String], default: [] },
    description: { type: String }
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate"
    },
    category: { type: String, required: true },
    language: { type: String, required: true },
    framework: { type: String, required: true },
    version: { type: String, default: "1.0.0" },
    tasks: { type: [TaskSchema], default: [] },
    files: { type: [FileSchema], default: [] }
  },
  {
    timestamps: true
  }
);

export type IProjectDocument = ProjectData & Document;

export default mongoose.models.Project ||
  mongoose.model<IProjectDocument>("Project", ProjectSchema);
