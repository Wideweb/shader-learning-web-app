export interface Task {
    id: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHint[];
    restrictions: TaskRestriction[];
    order: number;
    cost: number;
    description: string;
    likes: number;
    dislikes: number;
    createdBy: { id: number; name: string };
}

export interface CreateTaskDto {
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHint[];
    restrictions: TaskRestriction[];
    order: number;
    cost: number;
    threshold: number;
    description: string;
    visibility: boolean;
}

export interface UpdateTaskDto {
    id: number
    name: string;
    vertexShader: string;
    fragmentShader: string;
    hints: TaskHint[];
    restrictions: TaskRestriction[];
    order: number;
    cost: number;
    threshold: number;
    description: string;
    visibility: boolean;
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
    id: number;
    vertexShader: string;
    fragmentShader: string;
}

export interface UserTask {
    task: Task,
    vertexShader: string;
    fragmentShader: string;
    liked: boolean;
    disliked: boolean;
}

export interface UserTaskResultDto {
    id: number;
    name: string;
    order: number;
    accepted: boolean;
    rejected: boolean;
    score: number;
}

export interface TaskListDto {
    id: number;
    name: string;
    order: number;
    cost: number;
    threshold: number;
    visibility: boolean;
}