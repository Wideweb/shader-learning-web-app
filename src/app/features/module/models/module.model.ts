import { ModuleTaskListDto } from "./module-task-list.model";

export interface ModuleDto {
    id: number;
    name: string;
    description: string;
    order: number;
    createdBy: { id: number; name: string };
    tasks: ModuleTaskListDto[];
    locked: boolean;
    cover: File | null;
    pageHeaderImage: File | null;
}