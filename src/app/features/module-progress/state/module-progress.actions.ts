import { TaskSubmitDto } from "../models/task.model";

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
}

export class ModuleProgressSubmitTask {
    static readonly type = '[ModuleProgress] Submit Task';
    constructor(public payload: TaskSubmitDto) {}
}