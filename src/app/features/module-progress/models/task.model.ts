import { GlScene } from "../../common/gl-scene/models";
import { GlProgramChannel } from "../../common/services/gl.service";

export interface TaskDto {
    id: number;
    moduleId: number;
    name: string;
    vertexShader: string;
    fragmentShader: string;
    vertexCodeEditable: boolean,
    fragmentCodeEditable: boolean,
    hints: TaskHintDto[];
    restrictions: TaskRestrictionDto[];
    order: number;
    cost: number;
    description: string;
    likes: number;
    dislikes: number;
    createdBy: { id: number; name: string };
    channels: GlProgramChannel[];
    animated: boolean;
    animationSteps: number | null;
    animationStepTime: number | null;
    sceneSettings: GlScene;
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
    vertexShader: string;
    fragmentShader: string;
    at: Date;
}

export interface TaskSubmitDto {
    id: number;
    vertexShader: string;
    fragmentShader: string;
}

export interface TaskFeedbackDto {
    unclearDescription: false;
    strictRuntime: false;
    other: false;
    message: string;
}