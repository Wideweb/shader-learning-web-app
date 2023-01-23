import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { Logout } from "../../auth/state/auth.actions";
import { UserRankListDto } from "../models/user-rank-list.model";
import { UserRankListService } from "../services/user-rank-list.service";
import { UserRankListLoad } from "./user-rank-list.actions";

export interface UserRankListStateModel {
  list: UserRankListDto[];
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): UserRankListStateModel => {
  return {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<UserRankListStateModel>({
  name: 'UserRankList',
  defaults: defaults()
})
@Injectable({
  providedIn: 'root'
})
export class UserRankListState {

  @Selector()
  static list(state: UserRankListStateModel): UserRankListDto[] {
    return state.list;
  }

  @Selector()
  static loaded(state: UserRankListStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: UserRankListService) {}

  @Action(UserRankListLoad)
  async load(ctx: StateContext<UserRankListStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const list = await firstValueFrom(this.service.load());
      ctx.setState(patch<UserRankListStateModel>({ list, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<UserRankListStateModel>({ error }));
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(Logout)
  clear(ctx: StateContext<UserRankListStateModel>) {
    ctx.patchState(defaults());
  }
}