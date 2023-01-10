export interface TaskDto {
    id: number;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHintDto[];
    restrictions: TaskRestrictionDto[];
    cost: number;
    threshold: number;
    description: string;
    visibility: boolean;
    likes: number;
    dislikes: number;
    createdBy: { id: number; name: string };
    order: number;
}

export interface TaskSaveDto {
    id: number | undefined;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHintDto[];
    restrictions: TaskRestrictionDto[];
    cost: number;
    threshold: number;
    description: string;
    visibility: boolean;
}

export interface TaskHintDto {
    // id: string;
    message: string;
    cost: number;
    // order: number;
}

export interface TaskRestrictionDto {
    cost: number;
    instruction: string;
}