import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { firstValueFrom } from "rxjs";
import { FeedbackLoad } from "./feedback.actions";
import { FeedbackDto } from "../models/feedback.model";
import { FeedbackService } from "../services/feedback.service";

export interface FeedbackStateModel {
  list: FeedbackDto[];
  loading: boolean;
  loaded: boolean;
  error: any;
}

const defaults = (): FeedbackStateModel => {
  return {
    list: [],
    loading: false,
    loaded: false,
    error: null,
  }
}

@State<FeedbackStateModel>({
  name: 'LandingFeedback',
  defaults: defaults()
})
@Injectable()
export class FeedbackState {

  @Selector()
  static list(state: FeedbackStateModel): FeedbackDto[] {
    return state.list;
  }

  @Selector()
  static loaded(state: FeedbackStateModel): boolean {
    return state.loaded;
  }

  constructor(private service: FeedbackService) {}

  @Action(FeedbackLoad)
  async load(ctx: StateContext<FeedbackStateModel>) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const list = await firstValueFrom(this.service.load());
      ctx.setState(patch<FeedbackStateModel>({ list, error: null }));
    } 
    catch(error)
    {
      ctx.setState(patch<FeedbackStateModel>({ error }));
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