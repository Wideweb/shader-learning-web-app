import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { FeedbackCardComponent, FeedbackCardModel } from './feedback-card/feedback-card.component';
import { FinitAction, emptyAction } from './finit-action';
import { easeLinier } from 'src/app/features/common/services/easing';
import { ComponentSize } from '../../../constants';

class OpacityAction extends FinitAction {
  constructor(private component: FeedbackComponent, duration: number, ease: (t: number) => number, private from: number, private to: number) {
    super(duration, ease);
  }

  protected override step(progress: number) {
    const t = this.ease(progress);
    const value = this.from + (this.to - this.from) * t;
    this.component.setOpacity(value);
  }
}

@Component({
  selector: 'feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnDestroy, OnInit { 

  @Input()
  public loaded = false;

  @Input()
  public data: FeedbackCardModel[] = [];

  @Input()
  public size: ComponentSize = ComponentSize.Big;

  @ViewChildren(FeedbackCardComponent, { read: ElementRef })
  private cards!: QueryList<ElementRef>;

  public visibleIndex = 0;

  private index = 0;

  private rafHandle = -1;

  private fadeOutAction = new OpacityAction(this, 200, easeLinier, 1.0, 0.0);

  private fadeInAction = new OpacityAction(this, 200, easeLinier, 0.0, 1.0);

  private action = emptyAction;

  get nextDisabled() {
    return !this.loaded || this.index + (this.isSecondaryVisible ? 2 : 1) >= this.data.length;
  }

  get prevDisabled() {
    return !this.loaded || this.index == 0;
  }

  get isPrimaryVisible() {
    return this.index < this.data.length;
  }

  get isSecondaryVisible() {
    return !this.isSmall;
  }

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  get isMedium() {
    return this.size === ComponentSize.Medium;
  }

  get isBig() {
    return this.size === ComponentSize.Big;
  }

  constructor(private hostRef: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if ('size' in changes) {
      if (!this.isSmall && (this.visibleIndex + 2) > this.data.length) {
        this.visibleIndex = Math.max(this.visibleIndex - 1, 0);
      }

      if (this.isSmall && (this.visibleIndex + 2) == this.data.length) {
        this.visibleIndex = Math.min(this.visibleIndex + 1, this.data.length - 1);
      }
    }

    if ('data' in changes) {
      this.data = this.data || [];
    }
  }

  next() {
    if (!this.nextDisabled) {
      this.index += 1;
      this.ngZone.runOutsideAngular(() => this.startTrasition());
    }
  }

  prev() {
    if (!this.prevDisabled)
    {
      this.index -= 1;
      this.ngZone.runOutsideAngular(() => this.startTrasition());
    }
  }

  private startTrasition(): void {
    if (this.action !== emptyAction) {
      const speed = Math.max(Math.abs(this.index - this.visibleIndex) * 2, this.fadeOutAction.getPlaySpeed());
      this.fadeOutAction.setPlaySpeed(speed);
      this.fadeInAction.setPlaySpeed(speed);
      return;
    }

    this.prepareSwitch();

    let t0 = performance.now();
    let t1 = t0;

    let component: FeedbackComponent = this;
    (function render() {
      t1 = performance.now();
      const deltaTime = t1 - t0;
      t0 = t1;

      component.action.update(deltaTime);
      component.updateTransition();

      if (component.action === emptyAction && component.index !== component.visibleIndex) {
        component.prepareSwitch();
      }

      if (component.action !== emptyAction) {
        component.rafHandle = requestAnimationFrame(render);
      }
    }());
  }

  prepareSwitch() {
    this.fadeOutAction.setDirection(true);
    this.fadeOutAction.reset();
    this.fadeOutAction.setPlaySpeed(1);

    this.fadeInAction.setDirection(true);
    this.fadeInAction.reset();
    this.fadeInAction.setPlaySpeed(1);

    this.action = this.fadeOutAction;
  }

  updateTransition() {
    if (this.action === this.fadeOutAction) {
      
      // if (this.index === this.visibleIndex) {
      //   if (this.action.isForward()) {
      //     this.action.setDirection(false);
      //   } 

      //   if (this.action.isDone()) {
      //     this.action = emptyAction;
      //   }

      //   return;
      // }

      // if (!this.action.isForward()) {
      //   this.action.setDirection(true);
      // } 

      if (this.action.isForward() && this.action.isDone()) {
        this.ngZone.run(() => this.switchPage());
        this.action = this.fadeInAction;
        this.action.setDirection(true);
        this.action.reset();
      }

      return;
    }

    if (this.action === this.fadeInAction) {

      // if (this.index != this.visibleIndex) {
      //   if (this.action.isForward()) {
      //     this.action.setDirection(false);
      //   } 
        
      //   if (!this.action.isForward() && this.action.isDone()) {
      //     this.switchPage();
      //     this.action.setDirection(true);
      //     this.action.reset();
      //   }
      // } else if (!this.action.isForward()) {
      //   this.action.setDirection(true);
      // }

      if (this.action.isForward() && this.action.isDone()) {
        this.action = emptyAction;
        return;
      }
    }
  }

  setOpacity(value: number) {
    this.cards.map(e => e.nativeElement.style.setProperty('opacity', value));
  }

  switchPage() {
    this.visibleIndex += Math.sign(this.index - this.visibleIndex);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafHandle);
  }
}