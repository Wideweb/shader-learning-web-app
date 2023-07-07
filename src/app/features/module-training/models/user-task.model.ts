import { TaskDto } from "./task.model";

export interface UserTaskDto {
    task: TaskDto;
    vertexShader: string;
    fragmentShader: string;
    defaultVertexShader: string;
    defaultFragmentShader: string;
    liked: boolean;
    disliked: boolean;
    submissions: UserTaskSubmissionDto[];
}

export interface UserTaskSubmissionDto {
    score: number;
    accepted: boolean;
    vertexShader: string;
    fragmentShader: string;
    at: Date;
}