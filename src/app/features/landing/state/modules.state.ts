import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { ModulesLoad } from "./modules.actions";
import { ModuleDto } from "../models/module.model";
import { ModulesService } from "../services/modules.service";

export interface ModulesStateModel {
  list: ModuleDto[];
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): ModulesStateModel => {
  return {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<ModulesStateModel>({
  name: 'LandingModules',
  defaults: defaults()
})
@Injectable()
export class ModulesState {

  @Selector()
  static list(state: ModulesStateModel): ModuleDto[] {
    return state.list;
  }

  @Selector()
  static loaded(state: ModulesStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: ModulesService) {}

  @Action(ModulesLoad)
  async load(ctx: StateContext<ModulesStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const list = await firstValueFrom(this.service.load());
      ctx.setState(patch<ModulesStateModel>({ list, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<ModulesStateModel>({ error }));
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