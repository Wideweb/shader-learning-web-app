import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { TaskProgressDto } from "../models/task-progress.model";
import { UserProfileDto } from "../models/user-profile.model";
import { UserProfileService } from "../services/user-profile.service";
import { UserProfileLoad, UserProfileLoadMe, UserProfileLoadProgress } from "./user-profile.actions";

export interface UserProfileStateModel {
  me: UserProfileDto | null;
  userProfile: UserProfileDto | null;
  userProgress: TaskProgressDto[],
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): UserProfileStateModel => {
  return {
    me: null,
    userProfile: null,
    userProgress: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<UserProfileStateModel>({
  name: 'UserProfile',
  defaults: defaults()
})
@Injectable()
export class UserProfileState {

  @Selector()
  static me(state: UserProfileStateModel): UserProfileDto | null {
    return state.me;
  }

  @Selector()
  static meRank(state: UserProfileStateModel): number {
    return state.me?.rank || 0;
  }

  @Selector()
  static userProfile(state: UserProfileStateModel): UserProfileDto | null {
    return state.userProfile;
  }

  @Selector()
  static userRank(state: UserProfileStateModel): number {
    return state.userProfile?.rank || 0;
  }

  @Selector()
  static userProgress(state: UserProfileStateModel): TaskProgressDto[] | null {
    return state.userProgress;
  }

  @Selector()
  static loaded(state: UserProfileStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: UserProfileService) {}

  @Action(UserProfileLoadMe)
  async loadMe(ctx: StateContext<UserProfileStateModel>, action: UserProfileLoad) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const me = await firstValueFrom(this.service.getProfile(action.id));
      ctx.setState(patch<UserProfileStateModel>({ me, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<UserProfileStateModel>({ error }));
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(UserProfileLoad)
  async loadProfile(ctx: StateContext<UserProfileStateModel>, action: UserProfileLoad) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const userProfile = await firstValueFrom(this.service.getProfile(action.id));
      ctx.setState(patch<UserProfileStateModel>({ userProfile, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<UserProfileStateModel>({ error }));
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(UserProfileLoadProgress)
  async loadProgress(ctx: StateContext<UserProfileStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const userProgress = await firstValueFrom(this.service.getProgress());
      ctx.setState(patch<UserProfileStateModel>({ userProgress, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<UserProfileStateModel>({ error }));
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