import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppEventService } from '../../services/event.service';
import { Subject, takeUntil } from 'rxjs';
import { toRem } from '../../services/utils';

@Component({
  selector: 'app-sticky',
  templateUrl: './sticky.component.html',
  styleUrls: ['./sticky.component.scss']
})
export class AppStickyComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('stickable') stickable!: ElementRef;
  
  @ViewChild('placeholder') placeholder!: ElementRef; 

  private sticked = false;

  private stickOffset = 0;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private hostRef: ElementRef, private appEvents: AppEventService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.appEvents.pageScroll$.pipe(takeUntil(this.destroy$)).subscribe((top) => this.onScroll(top));
  }

  onScroll(top: number) {
    if (!this.stickable || !this.placeholder) {
      return;
    }

    console.log(this.stickable.nativeElement.clientHeight);

    if (this.sticked) {
      if ((this.stickOffset + top) > 0) {
        this.stickable.nativeElement.classList.remove("sticky");
        this.placeholder.nativeElement.style.setProperty('height', '0');
        this.sticked = false;
      }
      return;
    }

    if ((this.stickable.nativeElement.offsetTop + top) < 0) {
      this.stickOffset = this.stickable.nativeElement.offsetTop;
      this.sticked = true;
      
      this.placeholder.nativeElement.style.setProperty('height', `${this.stickable.nativeElement.clientHeight}px`);
      this.stickable.nativeElement.classList.add("sticky");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
