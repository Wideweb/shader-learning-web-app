import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { insertItem, patch, updateItem } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from "../../app/app.constants";
import { Login, Logout } from "../../auth/state/auth.actions";
import { ModuleProgressDto } from "../models/module-progress.model";
import { TaskProgressDto } from "../models/task-progress.model";
import { TaskDto, TaskSubmitResultDto } from "../models/task.model";
import { UserTaskDto, UserTaskSubmissionDto } from "../models/user-task.model";
import { ModuleProgressService } from "../services/module-progress.service";
import { UserTaskService } from "../services/user-task.service";
import { ModuleProgressLoad, ModuleProgressLoadNextTask, ModuleProgressLoadTask, ModuleProgressReplaceCode, ModuleProgressResetToDefaultCode, ModuleProgressResetToLastSubmettedCode, ModuleProgressSubmitTask, ModuleProgressSwitchToNextTask, ModuleProgressSwitchToPrevTask, ModuleProgressToggleTaskDislike, ModuleProgressToggleTaskLike, ModuleProgressUnselectCurrentTask, ModuleProgressUpdateUserProgramCode } from "./module-training-common.actions";

export interface UserShaderProgram {
  vertex: string,
  fragment: string,
  compile: boolean,
};

export interface ModuleProgressStateModel {
  module: ModuleProgressDto | null;
  userTask: UserTaskDto | null,
  userShaderProgram: UserShaderProgram,
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
    userShaderProgram: {
      vertex: DEFAULT_VERTEX_SHADER,
      fragment: DEFAULT_FRAGMENT_SHADER,
      compile: false,
    },
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
  static isNextTaskAvailable(state: ModuleProgressStateModel): boolean {
    if (!state.userTask || !state.module) {
      return false;
    }

    const currentTaskId = state.userTask.task.id;
    const currentTaskIndex = state.module.tasks.findIndex(task => task.id === currentTaskId);

    const isAccepted = currentTaskIndex >= 0 && state.module.tasks[currentTaskIndex]?.accepted;
    const isLast = currentTaskIndex == state.module.tasks.length - 1;
    const isNextAccepted = !isLast && state.module.tasks[currentTaskIndex + 1]?.accepted;

    return !isLast && (isAccepted || isNextAccepted);
  }

  @Selector()
  static isFirstTask(state: ModuleProgressStateModel): boolean {
    if (!state.userTask || !state.module) {
      return false;
    }

    const currentTaskId = state.userTask?.task.id;
    const currentTaskIndex = state.module.tasks.findIndex(task => task.id === currentTaskId);
    return currentTaskIndex === 0;
  }

  @Selector()
  static isLastTask(state: ModuleProgressStateModel): boolean {
    if (!state.module || !state.userTask || !state.userTask.task) {
      return false;
    }

    const index = state.module.tasks.findIndex(t => t.id === state.userTask!.task.id);

    return state.module.tasks.length === index + 1;
  }

  @Selector()
  static userTask(state: ModuleProgressStateModel): UserTaskDto | null {
    return state.userTask;
  }

  @Selector()
  static userTaskLiked(state: ModuleProgressStateModel): boolean {
    return state.userTask?.liked === true;
  }

  @Selector()
  static userTaskDisliked(state: ModuleProgressStateModel): boolean {
    return state.userTask?.disliked === true;
  }

  @Selector()
  static task(state: ModuleProgressStateModel): TaskDto | null {
    return state.userTask?.task || null;
  }

  @Selector()
  static userShaderProgram(state: ModuleProgressStateModel): UserShaderProgram {
    return state.userShaderProgram;
  }

  @Selector()
  static userTaskSubmissions(state: ModuleProgressStateModel): UserTaskSubmissionDto[] {
    return state.userTask?.submissions || [];
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

  @Selector()
  static userTaskLoading(state: ModuleProgressStateModel): boolean {
    return state.userTaskLoading;
  }

  constructor(private moduleProgressService: ModuleProgressService, private userTaskService: UserTaskService) {}

  @Action(ModuleProgressLoad)
  async load(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressLoad) {
    if (ctx.getState().module?.id == action.id) {
      return;
    }

    ctx.setState(patch<ModuleProgressStateModel>({ loaded: false, loading: true }));

    try 
    {
      if (action.userProgress) {
        const module = await firstValueFrom(this.moduleProgressService.getUserProgress(action.id));
        ctx.setState(patch<ModuleProgressStateModel>({
          module,
          finished: !!module && this.findNextTaskId(module, null) === null,
          error: null
        }));
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

        ctx.setState(patch<ModuleProgressStateModel>({
          module: moduleProgress,
          finished: !!moduleProgress && this.findNextTaskId(moduleProgress, null) === null,
          error: null
        }));
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

    ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: false, userTaskLoading: true }));

    try 
    {
      let userTask = ctx.getState().userTasks.find(userTask => userTask.task.id == action.id);
      if (!userTask) {
        userTask = await this.userTaskService.get(action.id);
      }

      ctx.setState(patch<ModuleProgressStateModel>({ 
        userTasks: insertItem(userTask),
        userTask,
        userShaderProgram: {
          vertex: userTask.vertexShader,
          fragment: userTask.fragmentShader,
          compile: true,
        },
        error: null,
        userTaskLoaded: true,
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
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoading: false }));
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
      throw "App Error: no module";
    }

    try 
    {
      const nextTaskId = this.findNextTaskId(module, ctx.getState().userTask?.task);
      if (!nextTaskId) {
        ctx.setState(patch<ModuleProgressStateModel>({ userTask: null, finished: true }));
        return null;
      }

      if (ctx.getState().userTask?.task.id == nextTaskId) {
        ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: true }));
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
        userShaderProgram: {
          vertex: userTask.vertexShader,
          fragment: userTask.fragmentShader,
          compile: true,
        },
        error: null,
        userTaskLoaded: true,
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
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoading: false }));
    }
  }
  
  private findNextTaskId(module: ModuleProgressDto, currTask: TaskDto | null | undefined) {
    if (currTask) {
      const nextTask = module.tasks.find(task => task.order > currTask.order);
      if (nextTask) {
        return nextTask.id;
      }
    }

    const nextTask = module.tasks.find(task => !task.accepted);
    return nextTask ? nextTask.id : null;
  }

  @Action(ModuleProgressSwitchToNextTask)
  async switchToNextTask(ctx: StateContext<ModuleProgressStateModel>) {
    if (ctx.getState().userTaskLoading) {
      return;
    }

    ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: false, userTaskLoading: true }));

    const module = ctx.getState().module;
    if (!module) {
      throw "App Error: no module";
    }

    try 
    {
      const currentTaskId = ctx.getState().userTask?.task.id;
      const currentTaskIndex = module.tasks.findIndex(task => task.id === currentTaskId);

      const isAccepted = currentTaskIndex >= 0 && module.tasks[currentTaskIndex]?.accepted;
      const isLast = currentTaskIndex == module.tasks.length - 1;
      const isNextAccepted = !isLast && module.tasks[currentTaskIndex + 1]?.accepted;

      if (isLast || (!isAccepted && !isNextAccepted))
      {
        ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: true }));
        return ctx.getState().userTask;
      }

      const nextTask = module.tasks[currentTaskIndex + 1];

      let userTask = ctx.getState().userTasks.find(userTask => userTask.task.id == nextTask.id);
      if (!userTask) {
        userTask = await this.userTaskService.get(nextTask.id);
      }

      ctx.setState(patch<ModuleProgressStateModel>({ 
        userTasks: insertItem(userTask),
        userTask,
        userShaderProgram: {
          vertex: userTask.vertexShader,
          fragment: userTask.fragmentShader,
          compile: true,
        },
        error: null,
        userTaskLoaded: true,
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
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoading: false }));
    }
  }

  @Action(ModuleProgressSwitchToPrevTask)
  async switchToPrevTask(ctx: StateContext<ModuleProgressStateModel>) {
    if (ctx.getState().userTaskLoading) {
      return;
    }

    ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: false, userTaskLoading: true }));

    const module = ctx.getState().module;
    if (!module) {
      throw "App Error: no module";
    }

    try 
    {
      const currentTaskId = ctx.getState().userTask?.task.id;
      const currentTaskIndex = module.tasks.findIndex(task => task.id === currentTaskId);
      if (currentTaskIndex <= 0)
      {
        ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoaded: true }));
        return ctx.getState().userTask;
      }

      const prevTask = module.tasks[currentTaskIndex - 1];

      let userTask = ctx.getState().userTasks.find(userTask => userTask.task.id == prevTask.id);
      if (!userTask) {
        userTask = await this.userTaskService.get(prevTask.id);
      }

      ctx.setState(patch<ModuleProgressStateModel>({ 
        userTasks: insertItem(userTask),
        userTask,
        userShaderProgram: {
          vertex: userTask.vertexShader,
          fragment: userTask.fragmentShader,
          compile: true,
        },
        error: null,
        userTaskLoaded: true,
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
      ctx.setState(patch<ModuleProgressStateModel>({ userTaskLoading: false }));
    }
  }

  @Action(ModuleProgressSubmitTask)
  async submit(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressSubmitTask) {
    ctx.setState(patch<ModuleProgressStateModel>({ taskSubmitResult: null }));

    const module = ctx.getState().module;
    if (!module) {
      throw "App Error: no module";
    }

    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "App Error: no task";
    }

    const task = module.tasks.find(t => t.id == userTask.task.id);
    if (!task) {
      throw "App Error: no task";
    }

    try 
    {
      const taskSubmitResult = await this.userTaskService.submit(action.payload, userTask.task);

      const accepted = taskSubmitResult.accepted || task.accepted;
      const rejected = !accepted;
      const score = taskSubmitResult.score > task.score ? taskSubmitResult.score : task.score;
      const match = taskSubmitResult.match > task.match ? taskSubmitResult.match : task.match;

      const submission: UserTaskSubmissionDto = {
        score: taskSubmitResult.score,
        accepted: taskSubmitResult.accepted,
        vertexShader: taskSubmitResult.vertexShader,
        fragmentShader: taskSubmitResult.fragmentShader,
        at: taskSubmitResult.at,
      };

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
          submissions: insertItem(submission, 0)
        }),
        userTasks: updateItem(it => it?.task.id == userTask.task.id, patch({ 
          fragmentShader: action.payload.fragmentShader,
          submissions: insertItem(submission, 0)
        })),
        taskSubmitResult,
        error: null
      }));

      if (accepted) {
        const nextTaskId = this.findNextTaskId(ctx.getState().module!, ctx.getState().userTask?.task);
        if (nextTaskId) {
          ctx.setState(patch<ModuleProgressStateModel>({
            module: patch<ModuleProgressDto>({
              tasks: updateItem(task => task?.id == nextTaskId, patch({ 
                locked: false
              }))
            }),
          }));
        } else {
          ctx.setState(patch<ModuleProgressStateModel>({ finished: true }));
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

    return await this.toggleLikeOrDislike(ctx, true, !userTask.liked);
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

  @Action(ModuleProgressUpdateUserProgramCode)
  async updateUserTaskFragmentCode(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressUpdateUserProgramCode) {
    ctx.setState(patch<ModuleProgressStateModel>({
      userShaderProgram: {
        vertex: action.vertex,
        fragment: action.fragment,
        compile: false,
      },
    }));
  }

  @Action(ModuleProgressResetToLastSubmettedCode)
  async resetToLastSubmittedCode(ctx: StateContext<ModuleProgressStateModel>) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    ctx.setState(patch<ModuleProgressStateModel>({
      userShaderProgram: {
        vertex: userTask.vertexShader || DEFAULT_VERTEX_SHADER,
        fragment: userTask.fragmentShader || DEFAULT_FRAGMENT_SHADER,
        compile: true,
      },
    }));
  }

  @Action(ModuleProgressResetToDefaultCode)
  async resetToDefaultCode(ctx: StateContext<ModuleProgressStateModel>) {
    const userTask = ctx.getState().userTask;
    if (!userTask) {
      throw "no task";
    }

    ctx.setState(patch<ModuleProgressStateModel>({
      userShaderProgram: {
        vertex: userTask.defaultVertexShader || DEFAULT_VERTEX_SHADER,
        fragment: userTask.defaultFragmentShader || DEFAULT_FRAGMENT_SHADER,
        compile: true,
      },
    }));
  }

  @Action(ModuleProgressReplaceCode)
  async replaceCode(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressReplaceCode) {
    ctx.setState(patch<ModuleProgressStateModel>({
      userShaderProgram: {
        vertex: action.vertex || DEFAULT_VERTEX_SHADER,
        fragment: action.fragment || DEFAULT_FRAGMENT_SHADER,
        compile: true,
      },
    }));
  }

  @Action(ModuleProgressUnselectCurrentTask)
  async unselectCurrentTask(ctx: StateContext<ModuleProgressStateModel>, action: ModuleProgressUnselectCurrentTask) {
    ctx.setState(patch<ModuleProgressStateModel>({
      userTask: null,
      error: null,
      userTaskLoaded: false,
      userTaskLoading: false,
    }));
  }

  @Action([Logout, Login])
  clear(ctx: StateContext<ModuleProgressStateModel>) {
    ctx.patchState(defaults());
  }
}