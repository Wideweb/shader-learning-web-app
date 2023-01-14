import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { append, insertItem, patch, updateItem } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { ModuleProgressDto } from "../models/module-progress.model";
import { TaskDto, TaskSubmitResultDto } from "../models/task.model";
import { UserTaskDto } from "../models/user-task.model";
import { ModuleProgressService } from "../services/module-progress.service";
import { UserTaskService } from "../services/user-task.service";
import { ModuleProgressLoad, ModuleProgressLoadNextTask, ModuleProgressLoadTask, ModuleProgressSubmitTask, ModuleProgressToggleTaskDislike, ModuleProgressToggleTaskLike } from "./module-progress.actions";

export interface ModuleProgressStateModel {
  module: ModuleProgressDto | null;
  userTask: UserTaskDto | null,
  userTaskLoaded: boolean;
  userTaskLoading: boolean;
  userTasks: UserTaskDto[],
  taskSubmitResult: TaskSubmitResultDto | null;
  finished: boolean;
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): ModuleProgressStateModel => {
  return {
    module: null,
    userTask: null,
    userTaskLoaded: false,
    userTaskLoading: false,
    userTasks: [],
    taskSubmitResult: null,
    finished: false,
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<ModuleProgressStateModel>({
  name: 'ModuleProgress',
  defaults: defaults()
})
@Injectable()
export class ModuleProgressState {

  @Selector()
  static module(state: ModuleProgressStateModel): ModuleProgressDto | null {
    return state.module;
  }

  @Selector()
  static finished(state: ModuleProgressStateModel): boolean {
    return state.finished;
  }

  @Selector()
  static userTask(state: ModuleProgressStateModel): UserTaskDto | null {
    return state.userTask
  }

  @Selector()
  static taskSubmitResult(state: ModuleProgressStateModel): TaskSubmitResultDto | null {
    return state.taskSubmitResult;
  }

  @Selector()
  static loaded(state: ModuleProgressStateModel): boolean {
    return state.loaded;
  }

  @Selector()
  static userTaskLoaded(state: ModuleProgressStateModel): boolean {
    return state.userTaskLoaded;
  }

  constructor(private moduleProgressService: ModuleProgressService, private userTaskService: UserTaskService) {}

  @Action(ModuleProgressLoad)
  async load(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressLoad) {
    ctx.setState(patch<ModuleProgressStateModel>({ loaded: false, loading: true }));

    try 
    {
      const module = await firstValueFrom(this.moduleProgressService.get(action.id));
      ctx.setState(patch<ModuleProgressStateModel>({ module, error: null }));
      return module;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.setState(patch<ModuleProgressStateModel>({ loaded: true, loading: false }));
    }
  }

  @Action(ModuleProgressLoadTask)
  async loadTask(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressLoadTask) {
    if (ctx.getState().userTaskLoading) {
      return;
    }

    const userTask = ctx.getState().userTasks.find(userTask => userTask.task.id == action.id);
    if (userTask) {
      ctx.setState(patch<ModuleProgressStateModel>({ userTask, error: null }));
      return userTask;
    }

    ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: false, userTaskLoading: true }));

    try 
    {
      const userTask = await this.userTaskService.get(action.id);
      ctx.setState(patch<ModuleProgressStateModel>({ 
        userTasks: insertItem(userTask),
        userTask,
        error: null
      }));
      return userTask;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: true, userTaskLoading: false }));
    }
  }

  @Action(ModuleProgressLoadNextTask)
  async loadNextTask(ctx: StateContext<ModuleProgressStateModel>) {
    if (ctx.getState().userTaskLoading) {
      return;
    }

    ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: false, userTaskLoading: true }));

    const module = ctx.getState().module;
    if (!module) {
      throw "no module";
    }

    try 
    {
      const nextTaskId = this.findNextTaskId(module, ctx.getState().userTask);
      if (!nextTaskId) {
        ctx.setState(patch<ModuleProgressStateModel>({ finished: true }));
        return null;
      }      

      const userTask = await this.userTaskService.get(nextTaskId);
      ctx.setState(patch<ModuleProgressStateModel>({ userTask, error: null }));
      return userTask;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: true, userTaskLoading: false }));
    }
  }
  
  private findNextTaskId(module: ModuleProgressDto, currentUserTask: UserTaskDto | null) {
    if (currentUserTask) {
      const nextTask = module.tasks.find(task => !task.accepted && task.order > currentUserTask.task.order);
      if (nextTask) {
        return nextTask.id;
      }
    }

    const nextTask = module.tasks.find(task => !task.accepted);
    return nextTask ? nextTask.id : null;
  }

  @Action(ModuleProgressSubmitTask)
  async submit(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressSubmitTask) {
    ctx.setState(patch<ModuleProgressStateModel>({ taskSubmitResult: null }));

    const module = ctx.getState().module;
    if (!module) {
      throw "no module";
    }

    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    const task = module.tasks.find(t => t.id == userTask.task.id);
    if (!task) {
      throw "no task";
    }

    try 
    {
      const taskSubmitResult = await this.userTaskService.submit(action.payload, userTask.task);

      const accepted = taskSubmitResult.accepted || task.accepted;
      const rejected = !accepted;
      const score = taskSubmitResult.score > task.score ? taskSubmitResult.score : task.score;
      const match = taskSubmitResult.match > task.match ? taskSubmitResult.match : task.match;

      ctx.setState(patch<ModuleProgressStateModel>({
        module: patch<ModuleProgressDto>({
          tasks: updateItem(task => task?.id == userTask.task.id, patch({ 
            accepted,
            rejected,
            score,
            match
           }))
        }),
        taskSubmitResult,
        error: null
      }));

      return taskSubmitResult;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleProgressToggleTaskLike)
  async toggleLike(ctx: StateContext<ModuleProgressStateModel>) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    this.toggleLikeOrDislike(ctx, true, !userTask.liked);
  }

  @Action(ModuleProgressToggleTaskDislike)
  async toggleDislike(ctx: StateContext<ModuleProgressStateModel>) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    this.toggleLikeOrDislike(ctx, false, !userTask.disliked);
  }

  private async toggleLikeOrDislike(ctx: StateContext<ModuleProgressStateModel>, likePass: boolean, value: boolean) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    try 
    {
      const response = await firstValueFrom(likePass 
        ? this.userTaskService.like(userTask.task.id, value)
        : this.userTaskService.dislike(userTask.task.id, value));

      let liked = userTask.liked;
      let disliked = userTask.disliked;

      if (response.updated && likePass) {
        liked = value; 
        disliked = false; 
      }

      if (response.updated && !likePass) {
        liked = false; 
        disliked = value; 
      }

      ctx.setState(patch<ModuleProgressStateModel>({ 
        error: null,
        userTask: patch<UserTaskDto>({
          liked,
          disliked,
          task: patch<TaskDto>({
            likes: response.likes,
            dislikes: response.dislikes
          })
        })
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
    }
  }
}