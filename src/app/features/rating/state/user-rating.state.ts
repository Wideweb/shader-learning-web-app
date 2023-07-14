import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { Logout } from "../../auth/state/auth.actions";
import { RatingService } from "../services/rating.service";
import { UserRatingDto } from "../models/user-rating.model";
import { UserRatingTaskDto } from "../models/user-rating-task.model";
import { UserRatingLoad } from "./user-rating.actions";

export interface UserRatingStateModel {
  user: UserRatingDto | null;
  userTasks: UserRatingTaskDto[],
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): UserRatingStateModel => {
  return {
    user: null,
    userTasks: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<UserRatingStateModel>({
  name: 'UserRating',
  defaults: defaults()
})
@Injectable({
  providedIn: 'root'
})
export class UserRatingState {

  @Selector()
  static user(state: UserRatingStateModel): UserRatingDto | null {
    return state.user;
  }

  @Selector()
  static userName(state: UserRatingStateModel): string {
    return state.user?.name || '';
  }

  @Selector()
  static userScore(state: UserRatingStateModel): number {
    return state.user?.rank || 0;
  }

  @Selector()
  static userAcceptions(state: UserRatingStateModel): number {
    return state.user?.solved || 0;
  }

  @Selector()
  static userSumbissions(state: UserRatingStateModel): number {
    return state.userTasks.length;
  }

  @Selector()
  static userTasks(state: UserRatingStateModel): UserRatingTaskDto[] {
    return state.userTasks;
  }

  @Selector()
  static hasTasks(state: UserRatingStateModel): boolean {
    return state.userTasks && state.userTasks.length > 0;
  }

  @Selector()
  static loaded(state: UserRatingStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: RatingService) {}

  @Action(UserRatingLoad)
  async load(ctx: StateContext<UserRatingStateModel>, action: UserRatingLoad) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const user = await firstValueFrom(this.service.getUser(action.id));
      const userTasks = await firstValueFrom(this.service.getUserTasks(action.id));

      ctx.setState(patch<UserRatingStateModel>({ user, userTasks, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<UserRatingStateModel>({ error }));
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
  clear(ctx: StateContext<UserRatingStateModel>) {
    ctx.patchState(defaults());
  }
}