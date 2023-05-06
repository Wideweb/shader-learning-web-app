import { TaskFeedbackDto, TaskSubmitDto } from "../models/task.model";

export class ModuleProgressLoad {
    static readonly type = '[ModuleProgress] Load Module';
    constructor(public id: number, public userProgress: boolean) {}
}

export class ModuleProgressLoadTask {
    static readonly type = '[ModuleProgress] Load Task';
    constructor(public id: number) {}
}

export class ModuleProgressLoadNextTask {
    static readonly type = '[ModuleProgress] Load Next Task';
}

export class ModuleProgressToggleTaskLike {
    static readonly type = '[ModuleProgress] Toogle Task Like';
}

export class ModuleProgressToggleTaskDislike {
    static readonly type = '[ModuleProgress] Toggle Task Dislike';
    constructor(public feedback: TaskFeedbackDto | null = null) {}
}

export class ModuleProgressUpdateUserProgramCode {
    static readonly type = '[ModuleProgress] Update User Program Code';
    constructor(public vertex: string, public fragment: string) {}
}

export class ModuleProgressResetToLastSubmettedCode {
    static readonly type = '[ModuleProgress] Reset To Last Submitted Code';
}

export class ModuleProgressResetToDefaultCode {
    static readonly type = '[ModuleProgress] Reset To Default Code';
}

export class ModuleProgressReplaceCode {
    static readonly type = '[ModuleProgress] Replace Code';
    constructor(public vertex: string, public fragment: string) {}
}

export class ModuleProgressSubmitTask {
    static readonly type = '[ModuleProgress] Submit Task';
    constructor(public payload: TaskSubmitDto) {}
}

export class ModuleProgressUnselectCurrentTask {
    static readonly type = '[ModuleProgress] Unselect Current Task';
}