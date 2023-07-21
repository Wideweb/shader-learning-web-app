import { CreateModuleDto } from "../models/module-create.model";
import { UpdateModuleDto } from "../models/module-update.model";
import { TaskDto } from "../models/task.model";

export class ModuleLoad {
    static readonly type = '[Module] Load';
    constructor(public id: number) {}
}

export class ModuleCreate {
    static readonly type = '[Module] Create';
    constructor(public payload: CreateModuleDto) {}
}

export class ModuleUpdate {
    static readonly type = '[Module] Update';
    constructor(public payload: UpdateModuleDto) {}
}

export class ModuleEditNameBegin {
    static readonly type = '[Module] Begin Edit Name';
}

export class ModuleEditNameCancel {
    static readonly type = '[Module] Cancel Edit Name';
}

export class ModuleUpdateName {
    static readonly type = '[Module] Name Update';
    constructor(public name: string) {}
}

export class ModuleEditDescriptionBegin {
    static readonly type = '[Module] Begin Edit Description';
}

export class ModuleEditDescriptionCancel {
    static readonly type = '[Module] Cancel Edit Description';
}

export class ModuleUpdateDescription {
    static readonly type = '[Module] Description Update';
    constructor(public description: string) {}
}

export class ModuleUpdateCover {
    static readonly type = '[Module] Cover Update';
    constructor(public file: File) {}
}

export class ModuleUpdatePageHeaderImage {
    static readonly type = '[Module] Page Header Image';
    constructor(public file: File) {}
}

export class ModuleToggleLock {
    static readonly type = '[Module] Toggle Lock';
}

export class ModuleTaskUpdate {
    static readonly type = '[Module] Task Update';
    constructor(public payload: TaskDto) {}
}

export class ModuleTaskToggleVisibility {
    static readonly type = '[Task] Toggle Visibility';
    constructor(public taskId: number) {}
}

export class ModuleTaskReorder {
    static readonly type = '[Task] Reorder';
    constructor(public payload: { oldOrder: number, newOrder: number }) {}
}