import { TaskSaveDto } from "../models/task.model";

export class TaskNew {
    static readonly type = '[Task] New';
}

export class TaskLoad {
    static readonly type = '[Task] Load';
    constructor(public id: number) {}
}

export class TaskCreate {
    static readonly type = '[Task] Create';
    constructor(public payload: TaskSaveDto) {}
}

export class TaskUpdate {
    static readonly type = '[Task] Update';
    constructor(public payload: TaskSaveDto) {}
}