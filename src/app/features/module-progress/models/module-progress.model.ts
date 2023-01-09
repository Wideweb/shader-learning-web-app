import { TaskProgressDto } from "./task-progress.model";

export interface ModuleProgressDto {
    id: number;
    name: string;
    description: string;
    order: number;
    createdBy: { id: number; name: string };
    tasks: TaskProgressDto[];
    locked: boolean;
  }