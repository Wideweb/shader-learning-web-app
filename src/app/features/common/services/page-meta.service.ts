import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PageMetaService {

  private defaultTitle = 'Shader Learning';

  private defaultDescription = 'Shader Learning is a platform that helps you learn and enhance your shading skills by solving interactive problems.';

  public title$: Observable<string>;

  public description$: Observable<string>;

  private title = new BehaviorSubject<string>(this.defaultTitle);

  private description = new BehaviorSubject<string>(this.defaultTitle);

  constructor() {
    this.title$ = this.title.asObservable();
    this.description$ = this.description.asObservable();
  }

  public setTitle(title: string | null) {
    this.title.next(title ? `${title} - ${this.defaultTitle}` : this.defaultTitle);
  }

  public setDefaultTitle() {
    this.title.next(this.defaultTitle);
  }

  public setDescription(description: string | null) {
    this.description.next(description || this.defaultDescription);
  }

  public setDefaultDescription() {
    this.description.next(this.defaultDescription);
  }
}