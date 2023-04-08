import { GlScene } from "../../common/gl-scene/models";

export interface TaskDto {
    id: number;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    defaultVertexShader: string | null;
    defaultFragmentShader: string | null;
    vertexCodeEditable: boolean,
    fragmentCodeEditable: boolean,
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
    channels: TaskChannelDto[];
    animated: boolean;
    animationSteps: number | null;
    animationStepTime: number | null;
    sceneSettings: GlScene;
}

export interface TaskSaveDto {
    id: number | undefined;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    defaultVertexShader: string | null;
    defaultFragmentShader: string | null;
    vertexCodeEditable: boolean,
    fragmentCodeEditable: boolean,
    hints: TaskHintDto[];
    restrictions: TaskRestrictionDto[];
    cost: number;
    threshold: number;
    description: string;
    visibility: boolean;
    channels: TaskChannelDto[];
    animated: boolean;
    animationSteps: number | null;
    animationStepTime: number | null;
    sceneSettings: GlScene;
}

export interface TaskChannelDto {
    file: File;
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