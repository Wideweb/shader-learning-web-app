import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_TASK_DESCRIPTION, DEFAULT_VERTEX_SHADER } from "../../app/app.constants";
import { SpinnerService } from "../../common/services/spinner.service";
import { TaskDto } from "../models/task.model";
import { TaskService } from "../services/task.service";
import { ModuleTaskUpdate } from "./module.actions";
import { TaskCreate, TaskLoad, TaskNew, TaskUpdate } from "./task.actions";

export interface TaskStateModel {
  current: TaskDto | null;
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): TaskStateModel => {
  return {
    current: null,
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<TaskStateModel>({
  name: 'Task',
  defaults: defaults()
})
@Injectable()
export class TaskState {

  @Selector()
  static current(state: TaskStateModel): TaskDto | null {
    return state.current;
  }

  @Selector()
  static loaded(state: TaskStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: TaskService, private store: Store, private spinner: SpinnerService) {}

  @Action(TaskNew)
  async newTask(ctx: StateContext<TaskStateModel>) {
    ctx.patchState({
      loaded: true,
      loading: false,
      current: {
        id: 0,
        moduleId: 0,
        name: '',
        vertexShader: DEFAULT_VERTEX_SHADER,
        fragmentShader: DEFAULT_FRAGMENT_SHADER,
        hints: [],
        restrictions: [],
        cost: null as any,
        threshold: null as any,
        description: DEFAULT_TASK_DESCRIPTION,
        visibility: false,
        likes: 0,
        dislikes: 0,
        createdBy: { id: 0, name: '' },
        order: 0,
        channel1: null,
        channel2: null,
        animated: false,
        animationSteps: null,
        animationStepTime: null,
      }
    });
  }

  @Action(TaskLoad)
  async load(ctx: StateContext<TaskStateModel>, action: TaskLoad) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const current = await this.service.get(action.id);
      ctx.setState(patch<TaskStateModel>({ current, error: null }));
      await firstValueFrom(this.store.dispatch(new ModuleTaskUpdate(current)));
      return current;
    } 
    catch (error)
    {
      ctx.setState(patch<TaskStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(TaskCreate)
  async craete(ctx: StateContext<TaskStateModel>, action: TaskCreate) {
    this.spinner.show();
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const id = await this.service.create(action.payload);
      await firstValueFrom(ctx.dispatch(new TaskLoad(id)));
      return id;
    } 
    catch (error)
    {
      ctx.setState(patch<TaskStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
      this.spinner.hide();
    }
  }

  @Action(TaskUpdate)
  async update(ctx: StateContext<TaskStateModel>, action: TaskUpdate) {
    this.spinner.show();
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const id = await this.service.update(action.payload);
      await firstValueFrom(ctx.dispatch(new TaskLoad(id)));
      return id;
    } 
    catch (error)
    {
      ctx.setState(patch<TaskStateModel>({ error }));
      throw error;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
      this.spinner.hide();
    }
  }
}