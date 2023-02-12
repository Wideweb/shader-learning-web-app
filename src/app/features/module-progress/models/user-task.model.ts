import { TaskDto } from "./task.model";

export interface UserTaskDto {
    task: TaskDto,
    vertexShader: string;
    fragmentShader: string;
    defaultFragmentShader: string;
    liked: boolean;
    disliked: boolean;
}
