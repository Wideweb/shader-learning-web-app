import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { CarouselCardComponent, CarouselCardModel } from './carousel-card/carousel-card.component';
import { easeOutQuart } from 'src/app/features/common/services/easing';
import { saturate } from 'src/app/features/common/services/math';
import { toRem } from 'src/app/features/common/services/utils';
import { CarouselCardPlaceholderComponent } from './carousel-card-placeholder/carousel-card-placeholder.component';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ComponentSize } from '../../../constants';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnDestroy, OnInit, AfterViewInit { 

  @Input()
  public loaded = false;

  @Input()
  public data: CarouselCardModel[] = [];

  @Input()
  public cardWdith = 280;

  @Input()
  public cardsGap = 40;

  @Input()
  public size: ComponentSize = ComponentSize.Big;

  @Input()
  public velocity: number = 4;

  @ViewChild('table')
  private tableEl!: ElementRef;

  @ViewChildren(CarouselCardComponent, { read: ElementRef })
  private cards!: QueryList<ElementRef>;

  @ViewChildren(CarouselCardPlaceholderComponent, { read: ElementRef })
  private cardsPhs!: QueryList<ElementRef>;

  public phs: number[] = [];

  public tableWidth = 280;

  public gradientRightPosition = 0;

  public gradientLeftPosition = 0;

  private position = 0;

  public targetPosition = 0;

  private fromPosition = 0;

  private inTransition = false;

  public inTransition$ = new BehaviorSubject<boolean>(false);

  private rafHandle = -1;

  private touchStartX = 0;

  private touchStartY = 0;

  public innerData: CarouselCardModel[] = [];

  private destroy$: Subject<boolean> = new Subject<boolean>();

  get viewCapacity() {
    if (this.isBig) {
      return 3;
    }

    if (this.isMedium) {
      return 2;
    }

    return 1;
  }

  get maxCapacity() {
    if (this.isBig || this.isMedium) {
      return 10;
    }

    return 3;
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

  get nextDisabled() {
    return !this.loaded || this.targetPosition >= this.innerData.length - this.viewCapacity;
  }

  get prevDisabled() {
    return !this.loaded || this.targetPosition == 0;
  }

  get isFull() {
    return this.innerData && this.innerData.length == this.maxCapacity;
  }

  constructor(private hostRef: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.resize();
    this.cards.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.updatePosition());
    this.cardsPhs.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.updatePosition());
  }

  ngOnInit(): void {
    // this.updatePosition();
    // this.hostRef.nativeElement.style.setProperty('padding-left', `${this.containerPadding}px`);
    // this.hostRef.nativeElement.style.setProperty('padding-right', `${this.containerPadding}px`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('size' in changes || 'data' in changes) {
      this.innerData = (this.data || []).slice(0, this.maxCapacity);
    }

    if (['size', 'cardWdith', 'cardsGap'].some(it => it in changes)) {
      this.position = 0;
      this.targetPosition = 0;
      this.resize();
    } else if ('loaded' in changes || 'data' in changes) {
      this.updatePosition();
    }
  }

  resize() {
    this.tableWidth = (this.viewCapacity + 2) * this.cardWdith + (this.viewCapacity + 1) * this.cardsGap;

    if (this.tableEl) {
      this.tableEl.nativeElement.style.setProperty('left', toRem(-(this.cardWdith + this.cardsGap)));
    }

    // const ctrlWidth = 40;
    // const hostPadding = 50;
    // const hostWidth = 2 * (ctrlWidth + 50) + this.viewCapacity * this.cardWdith + (this.viewCapacity - 1) * this.cardsGap + hostPadding * 2;
    
    // this.hostRef.nativeElement.style.setProperty('width', `${toRem(hostWidth)}`);

    this.gradientLeftPosition = 0;
    this.gradientRightPosition = (this.viewCapacity + 1) * (this.cardWdith + this.cardsGap);

    this.phs = [...new Array(this.viewCapacity)];

    this.updatePosition();
  }

  next() {
    if (!this.nextDisabled) {
      this.targetPosition++;
      this.ngZone.runOutsideAngular(() => this.startTrasition());
    }
  }

  prev() {
    if (!this.prevDisabled)
    {
      this.targetPosition--;
      this.ngZone.runOutsideAngular(() => this.startTrasition());
    }
  }

  private startTrasition(): void {
    this.fromPosition = this.position;

    if (this.inTransition) {
      return;
    }
    
    this.inTransition = true;
    this.inTransition$.next(true);

    let t0 = performance.now();
    let t1 = t0;

    let component: CarouselComponent = this;
    (function render() {
      if (component.inTransition) {
        component.rafHandle = requestAnimationFrame(render);
      }

      t1 = performance.now();
      const deltaTime = t1 - t0;
      t0 = t1;

      const initDistance = Math.abs(component.targetPosition - component.fromPosition);
      const distance = Math.abs(component.targetPosition - component.position);
      const progress = easeOutQuart(saturate(distance / initDistance));

      const velocity = (component.targetPosition - component.fromPosition) * component.velocity;
      const delta = velocity * (deltaTime / 1000) * Math.max(0.01, progress);
      
      if (Math.abs(delta) > Math.abs(component.targetPosition - component.position) || progress < 0.01) {
        component.position = component.targetPosition;
        component.ngZone.run(() => {
          component.inTransition = false;
          component.inTransition$.next(false);
        });
      } else {
        component.position += delta;
      }
      
      component.updatePosition();
    }());
  }

  updatePosition() {
    if (this.loaded && !this.cards) {
      return;
    }

    if (!this.loaded && !this.cardsPhs) {
      return;
    }

    (this.loaded ? this.innerData : this.phs)
      .map((_, index) => (index - this.position + 1) * (this.cardWdith + this.cardsGap))
      .map(position => Math.round(position))
      .forEach((position, index) => {
        const el = (this.loaded ? this.cards : this.cardsPhs).get(index)?.nativeElement;

        if (!el) {
          return;
        }

        const left = toRem(position);
        if (el.style.getPropertyValue('left') != left) {
          el.style.setProperty('left', left);
        }
      });
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].pageX;
    this.touchStartY = event.touches[0].pageY;
  }

  @HostListener('touchend', ['$event'])
  onTouchend(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].pageX;
    const touchEndY = event.changedTouches[0].pageY;

    if (Math.abs(touchEndX - this.touchStartX) < Math.abs(touchEndY - this.touchStartY)) {
      return;
    }

    if (touchEndX < this.touchStartX) {
      this.next();
    } else if (touchEndX > this.touchStartX) {
      this.prev();
    }
  }

  ngOnDestroy(): void {
    this.inTransition = false;
    cancelAnimationFrame(this.rafHandle);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
