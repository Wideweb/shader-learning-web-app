import { HttpClient, HttpContext } from "@angular/common/http";
import { Component, Input, OnChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { BehaviorSubject, Subject, shareReplay, takeUntil } from "rxjs";
import { CANCEL_SPINNER_TOKEN } from "../../interceptors/spinner.interceptor";

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
})
export class AppSvgIconComponent implements OnChanges {

  @Input()
  public name?: string;

  public svgIcon: any;

  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) { }

  public ngOnChanges(): void {
    if (!this.name) {
      this.svgIcon = '';
      return;
    }

    this.httpClient
      .get(`assets/${this.name}.svg`, { responseType: 'text', context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true) })
      .pipe(
        shareReplay(1),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.svgIcon = this.sanitizer.bypassSecurityTrustHtml(value);
        this.loading$.next(false);
      });
  }

  ngOnDestroy(): void {
    this.loading$.unsubscribe();

    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}