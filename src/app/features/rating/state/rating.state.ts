import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { Logout } from "../../auth/state/auth.actions";
import { UserRatingListDto } from "../models/user-rating-list.model";
import { RatingLoad } from "./rating.actions";
import { RatingService } from "../services/rating.service";

export interface RatingStateModel {
  list: UserRatingListDto[];
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): RatingStateModel => {
  return {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<RatingStateModel>({
  name: 'Rating',
  defaults: defaults()
})
@Injectable({
  providedIn: 'root'
})
export class RatingState {

  @Selector()
  static list(state: RatingStateModel): UserRatingListDto[] {
    return state.list;
  }

  @Selector()
  static loaded(state: RatingStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: RatingService) {}

  @Action(RatingLoad)
  async load(ctx: StateContext<RatingStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const list = await firstValueFrom(this.service.load());
      ctx.setState(patch<RatingStateModel>({ list, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<RatingStateModel>({ error }));
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
  clear(ctx: StateContext<RatingStateModel>) {
    ctx.patchState(defaults());
  }
}