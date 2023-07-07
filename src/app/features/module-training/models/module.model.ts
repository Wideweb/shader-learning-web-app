
export interface ModuleDto {
    id: number;
    name: string;
    description: string;
    order: number;
    createdBy: { id: number; name: string };
    tasks: ModuleTaskListDto[];
    locked: boolean;
}

export interface ModuleTaskListDto {
    id: number;
    moduleId: number;
    name: string;
    order: number;
    cost: number;
    threshold: number;
    visibility: boolean;
}