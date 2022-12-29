import { TaskListDto, UserTaskResultDto } from "./task.model";

export interface ModuleDto {
  id: number;
  name: string;
  description: string;
  order: number;
  createdBy: { id: number; name: string };
  tasks: TaskListDto[];
  locked: boolean;
}

export interface CreateModuleDto {
  name: string;
  description: string;
  locked: boolean;
}

export interface UpdateModuleDto {
  id: number;
  name: string;
  description: string;
  locked: boolean;
}

export interface ModuleListDto {
  id: number;
  name: string;
  description: string;
  tasks: number;
  order: number;
  locked: boolean;
  acceptedTasks: number;
}

export interface UserModuleProgressDto {
  id: number;
  name: string;
  description: string;
  order: number;
  createdBy: { id: number; name: string };
  tasks: UserTaskResultDto[];
  locked: boolean;
}