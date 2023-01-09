import { TaskDto } from "./task.model";

export interface UserTaskDto {
    task: TaskDto,
    vertexShader: string;
    fragmentShader: string;
    liked: boolean;
    disliked: boolean;
}
