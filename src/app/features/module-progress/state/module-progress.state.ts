import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { insertItem, patch, updateItem } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { Logout } from "../../auth/state/auth.actions";
import { ModuleProgressDto } from "../models/module-progress.model";
import { TaskProgressDto } from "../models/task-progress.model";
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
  static moduleName(state: ModuleProgressStateModel): string {
    return state.module?.name || '';
  }

  @Selector()
  static acceptetTasksRate(state: ModuleProgressStateModel): number {
    const tasks = state.module?.tasks || [];
    const tasksNumber = tasks.length;
    if (tasksNumber <= 0) {
      return 0;
    }

    const acceptedTasksNumber = tasks.filter(t => t.accepted).length;
    return acceptedTasksNumber / tasksNumber;
  }

  @Selector()
  static tasks(state: ModuleProgressStateModel): TaskProgressDto[] | [] {
    return state.module?.tasks || [];
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
      if (action.userProgress) {
        const module = await firstValueFrom(this.moduleProgressService.getUserProgress(action.id));
        ctx.setState(patch<ModuleProgressStateModel>({ module, error: null }));
        return module;
      } else {
        const module = await firstValueFrom(this.moduleProgressService.getView(action.id));
        let moduleProgress: ModuleProgressDto | null = null;

        if (module) {
          moduleProgress = {
            id: module.id,
            name: module.name,
            description: module.description,
            order: module.order,
            createdBy: module.createdBy,
            tasks: module.tasks.map((task, index) => ({
              id: task.id,
              moduleId: task.moduleId,
              name: task.name,
              order: task.order,
              accepted: false,
              rejected: false,
              score: 0,
              match: 0,
              locked: index > 0,
            })),
            locked: module.locked,
          };
        }

        ctx.setState(patch<ModuleProgressStateModel>({ module: moduleProgress, error: null }));
        return module;
      }
      
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
    if (ctx.getState().userTaskLoading || ctx.getState().userTask?.task.id == action.id) {
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
      const nextTaskId = this.findNextTaskId(module);
      if (!nextTaskId) {
        ctx.setState(patch<ModuleProgressStateModel>({ finished: true }));
        return null;
      }

      if (ctx.getState().userTask?.task.id == nextTaskId) {
        return ctx.getState().userTask;
      }

      const userTask = await this.userTaskService.get(nextTaskId);
      ctx.setState(patch<ModuleProgressStateModel>({
        module: patch<ModuleProgressDto>({
          tasks: updateItem(task => task?.id == userTask.task.id, patch({ 
            locked: false
           }))
        }),
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
  
  private findNextTaskId(module: ModuleProgressDto) {
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
          })),
        }),
        userTask: patch<UserTaskDto>({
          fragmentShader: action.payload.fragmentShader,
        }),
        userTasks: updateItem(it => it?.task.id == userTask.task.id, patch({ 
          fragmentShader: action.payload.fragmentShader,
        })),
        taskSubmitResult,
        error: null
      }));

      if (accepted) {
        const nextTaskId = this.findNextTaskId(ctx.getState().module!);
        if (nextTaskId) {
          ctx.setState(patch<ModuleProgressStateModel>({
            module: patch<ModuleProgressDto>({
              tasks: updateItem(task => task?.id == nextTaskId, patch({ 
                locked: false
              }))
            }),
          }));
        }
    }

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
  async toggleDislike(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressToggleTaskDislike) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    if (action.feedback) {
      try{
        await firstValueFrom(this.userTaskService.saveFeedback(userTask.task.id, action.feedback));
      } catch (_) { }
    }

    await this.toggleLikeOrDislike(ctx, false, !userTask.disliked);
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
        }),
        userTasks: updateItem(it => it?.task.id == userTask.task.id, patch({ 
          liked,
          disliked,
          task: patch<TaskDto>({
            likes: response.likes,
            dislikes: response.dislikes
          })
        }))
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleProgressStateModel>({ error }));
    }
  }

  @Action(Logout)
  clear(ctx: StateContext<ModuleProgressStateModel>) {
    ctx.patchState(defaults());
  }
}