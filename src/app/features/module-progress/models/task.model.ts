export interface TaskDto {
    id: number;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHintDto[];
    restrictions: TaskRestrictionDto[];
    order: number;
    cost: number;
    description: string;
    likes: number;
    dislikes: number;
    createdBy: { id: number; name: string };
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

export interface TaskSubmitResultDto {
    match: number;
    score: number;
    accepted: boolean;
}

export interface TaskSubmitDto {
    id: number;
    vertexShader: string;
    fragmentShader: string;
}