import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { iif, insertItem, patch, updateItem } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { Logout } from "../../auth/state/auth.actions";
import { ModuleTaskListDto } from "../models/module-task-list.model";
import { ModuleDto } from "../models/module.model";
import { ModuleService } from "../services/module.service";
import { ModuleCreate, ModuleEditDescriptionBegin, ModuleEditDescriptionCancel, ModuleEditNameBegin, ModuleEditNameCancel, ModuleLoad, ModuleTaskReorder, ModuleTaskToggleVisibility, ModuleTaskUpdate, ModuleToggleLock, ModuleUpdate, ModuleUpdateCover, ModuleUpdateDescription, ModuleUpdateName } from "./module.actions";

export interface ModuleStateModel {
  current: ModuleDto | null;
  loading: boolean;
  loaded: boolean;
  error: any;
  nameEdit: boolean
  descriptionEdit: boolean;
}

const defaults = (): ModuleStateModel => {
  return {
    current: null,
    loading: false,
    loaded: false,
    error: null,
    nameEdit: false,
    descriptionEdit: false,
  }
}

@State<ModuleStateModel>({
  name: 'Module',
  defaults: defaults()
})
@Injectable()
export class ModuleState {

  @Selector()
  static current(state: ModuleStateModel): ModuleDto | null {
    return state.current;
  }

  @Selector()
  static currentId(state: ModuleStateModel): number | null {
    return state.current?.id || null;
  }

  @Selector()
  static nameEdit(state: ModuleStateModel): boolean {
    return state.nameEdit;
  }

  @Selector()
  static descriptionEdit(state: ModuleStateModel): boolean {
    return state.descriptionEdit;
  }

  @Selector()
  static error(state: ModuleStateModel): any {
    return state.error;
  }

  @Selector()
  static loaded(state: ModuleStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: ModuleService) {}

  @Action(ModuleLoad)
  async load(ctx: StateContext<ModuleStateModel>, action: ModuleLoad) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const current = await this.service.get(action.id);
      ctx.setState(patch<ModuleStateModel>({ current, error: null }));
      return current;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
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

  @Action(ModuleCreate)
  async craete(ctx: StateContext<ModuleStateModel>, action: ModuleCreate) {
    try 
    {
      const id = await this.service.create(action.payload);
      ctx.dispatch(new ModuleLoad(id));
      return id;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleUpdate)
  async update(ctx: StateContext<ModuleStateModel>, action: ModuleUpdate) {
    try 
    {
      const id = await firstValueFrom(this.service.update(action.payload));
      ctx.dispatch(new ModuleLoad(id));
      return id;
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleUpdateName)
  async updateName(ctx: StateContext<ModuleStateModel>, action: ModuleUpdateName) {
    const module = ctx.getState().current;
    if (!module) {
      throw 'No module';
    }

    if (module.name === action.name) {
      return ctx.setState(patch<ModuleStateModel>({
        nameEdit: false,
      }));
    }

    try 
    {
      await firstValueFrom(this.service.updateName(module.id, action.name));
      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          name: action.name
        }),
        nameEdit: false,
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleUpdateDescription)
  async updateDescription(ctx: StateContext<ModuleStateModel>, action: ModuleUpdateDescription) {
    const module = ctx.getState().current;
    if (!module) {
      throw 'No module';
    }

    if (module.description === action.description) {
      return ctx.setState(patch<ModuleStateModel>({
        descriptionEdit: false,
      }));
    }

    try 
    {
      await firstValueFrom(this.service.updateDescription(module.id, action.description));
      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          description: action.description
        }),
        descriptionEdit: false,
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleUpdateCover)
  async updateCover(ctx: StateContext<ModuleStateModel>, action: ModuleUpdateCover) {
    const module = ctx.getState().current;
    if (!module) {
      throw 'No module';
    }

    try 
    {
      await this.service.updateCover(module.id, action.file);
      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          cover: action.file
        }),
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleToggleLock)
  async toggleLock(ctx: StateContext<ModuleStateModel>) {
    const module = ctx.getState().current;
    if (!module) {
      throw 'No module';
    }

    try 
    {
      const locked = await firstValueFrom(this.service.toggleLock(module.id));
      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          locked
        })
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleTaskToggleVisibility)
  async toggleTaskVisibility(ctx: StateContext<ModuleStateModel>, action: ModuleTaskToggleVisibility) {
    try 
    {
      const visibility = await firstValueFrom(this.service.toggleTaskVisibility(action.taskId));
      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          tasks: updateItem(task => task?.id == action.taskId, patch({ 
            visibility,
          })),
        })
      }));
    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleTaskReorder)
  async reorderTasks(ctx: StateContext<ModuleStateModel>, action: ModuleTaskReorder) {
    const module = ctx.getState().current;
    if (!module) {
      throw 'No module';
    }

    try 
    {
      await firstValueFrom(this.service.reorderTasks(module.id, action.payload.oldOrder, action.payload.newOrder));
      const tasks = await firstValueFrom(this.service.taskList(module.id));

      return ctx.setState(patch<ModuleStateModel>({
        current: patch<ModuleDto>({
          tasks,
        })
      }));

    } 
    catch (error)
    {
      ctx.setState(patch<ModuleStateModel>({ error }));
      throw error;
    }
  }

  @Action(ModuleTaskUpdate)
  updateTask(ctx: StateContext<ModuleStateModel>, action: ModuleTaskUpdate) {
    const updatedTask: ModuleTaskListDto = { 
      id: action.payload.id,
      moduleId: action.payload.moduleId,
      name: action.payload.name,
      order: action.payload.order,
      cost: action.payload.cost,
      threshold: action.payload.threshold,
      visibility: action.payload.visibility,
    };

    return ctx.setState(patch<ModuleStateModel>({
      current: patch<ModuleDto>({
        tasks: iif<ModuleTaskListDto[]>(
          tasks => tasks!.some(task => task.id === action.payload.id),
          updateItem(task => task?.id == action.payload.id, patch(updatedTask)),
          insertItem(updatedTask, updatedTask.order + 1)
        )
      })
    }));
  }

  @Action(ModuleEditNameBegin)
  beginEditName(ctx: StateContext<ModuleStateModel>) {
    return ctx.setState(patch<ModuleStateModel>({
      nameEdit: true
    }));
  }

  @Action(ModuleEditNameCancel)
  cancelEditName(ctx: StateContext<ModuleStateModel>) {
    return ctx.setState(patch<ModuleStateModel>({
      nameEdit: false
    }));
  }

  @Action(ModuleEditDescriptionBegin)
  beginEditDescription(ctx: StateContext<ModuleStateModel>) {
    return ctx.setState(patch<ModuleStateModel>({
      descriptionEdit: true
    }));
  }

  @Action(ModuleEditDescriptionCancel)
  cancelEditDescription(ctx: StateContext<ModuleStateModel>) {
    return ctx.setState(patch<ModuleStateModel>({
      descriptionEdit: false
    }));
  }

  @Action(Logout)
  clear(ctx: StateContext<ModuleStateModel>) {
    ctx.patchState(defaults());
  }
}