export interface Task {
    id: string;
    level: number;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHint[];
    restrictions: TaskRestriction[];
    order: number;
    cost: number;
}

export interface TaskHint {
    // id: string;
    message: string;
    cost: number;
    // order: number;
}

export interface TaskRestriction {
    cost: number;
    instruction: string;
}

export interface TaskSubmitResult {
    match: number;
    score: number;
    accepted: boolean;
}

export interface TaskSubmit {
    id: string;
    vertexShader: string;
    fragmentShader: string;
}

export interface UserTaskResultDto {
    id: number;
    name: string;
    order: number;
    accepted: boolean;
    rejected: boolean;
    score: number;
}