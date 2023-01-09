import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { ModuleListDto } from "../models/module-list.model";
import { ModuleListService } from "../services/module-list.service";
import { ModuleListLoad } from "./module-list.actions";

export interface ModuleListStateModel {
  list: ModuleListDto[];
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): ModuleListStateModel => {
  return {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<ModuleListStateModel>({
  name: 'ModuleList',
  defaults: defaults()
})
@Injectable()
export class ModuleListState {

  @Selector()
  static list(state: ModuleListStateModel): ModuleListDto[] {
    return state.list;
  }

  @Selector()
  static loaded(state: ModuleListStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: ModuleListService) {}

  @Action(ModuleListLoad)
  async load(ctx: StateContext<ModuleListStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const list = await firstValueFrom(this.service.load());
      ctx.setState(patch<ModuleListStateModel>({ list, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<ModuleListStateModel>({ error }));
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }
}