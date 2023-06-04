import { Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CarouselCardModel } from './carousel-card/carousel-card.component';
import { easeOutQuart } from 'src/app/features/common/services/easing';
import { saturate } from 'src/app/features/common/services/math';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnDestroy, OnInit { 

  @Input()
  public loaded = false;

  @Input()
  public data: CarouselCardModel[] = [];

  @Input()
  public viewCapacity = 3;

  @Input()
  public cardWdith = 280;

  @Input()
  public cardsGap = 40;

  public positions: number[] = [];

  public tableWidth = 280;

  private position = 0;

  private targetPosition = 0;

  private fromPosition = 0;

  private offset = 320;

  private inTransition = false;

  private rafHandle = -1;

  get nextDisabled() {
    return this.targetPosition >= this.data.length - this.viewCapacity;
  }

  get prevDisabled() {
    return this.targetPosition == 0;
  }

  constructor(private hostRef: ElementRef) {}

  ngOnInit(): void {
    this.tableWidth = (this.viewCapacity + 2) * this.cardWdith + (this.viewCapacity + 1) * this.cardsGap;

    const ctrlWidth = 40;
    const hostPadding = 50;
    const hostWidth = 2 * (ctrlWidth + 50) + this.viewCapacity * this.cardWdith + (this.viewCapacity - 1) * this.cardsGap + hostPadding * 2;
    
    this.hostRef.nativeElement.style.setProperty('width', `${hostWidth}px`);

    this.updatePosition();
    // this.hostRef.nativeElement.style.setProperty('padding-left', `${this.containerPadding}px`);
    // this.hostRef.nativeElement.style.setProperty('padding-right', `${this.containerPadding}px`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('loaded' in changes || 'data' in changes) {
      this.data = this.data || [];
      this.updatePosition();
    }
  }

  next() {
    if (!this.nextDisabled) {
      this.targetPosition++;
      this.startTrasition();
    }
  }

  prev() {
    if (!this.prevDisabled)
    {
      this.targetPosition--;
      this.startTrasition();
    }
  }

  private startTrasition(): void {
    this.fromPosition = this.position;

    if (this.inTransition) {
      return;
    }
    
    this.inTransition = true;

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

      const velocity = (component.targetPosition - component.fromPosition) / 1000 * 3;
      const delta = velocity * deltaTime * progress;

      if (Math.abs(delta) > Math.abs(component.targetPosition - component.position)) {
        component.position = component.targetPosition;
        component.inTransition = false;
      } else {
        component.position += delta;
      }
      
      component.updatePosition();
    }());
  }

  updatePosition() {
    const items = this.loaded ? this.data : [...new Array(this.viewCapacity)];
    this.positions = items.map((_, index) => (index - this.position) * (this.cardWdith + this.cardsGap) + this.offset);
  }

  ngOnDestroy(): void {
    this.inTransition = false;
    cancelAnimationFrame(this.rafHandle);
  }
}
