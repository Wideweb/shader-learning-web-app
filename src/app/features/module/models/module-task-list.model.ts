export interface ModuleTaskListDto {
    id: number;
    moduleId: number;
    name: string;
    order: number;
    cost: number;
    threshold: number;
    visibility: boolean;
}