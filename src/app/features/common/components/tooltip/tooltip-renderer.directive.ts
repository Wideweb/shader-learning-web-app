import { ConnectionPositionPair, Overlay, OverlayPositionBuilder, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ComponentRef, Directive, ElementRef, HostListener, Input, TemplateRef } from "@angular/core";
import { AppTooltipComponent } from "./tooltip.component";

@Directive({
    selector: '[appTooltip]'
})
export class AppTooltipRendererDirective {
  
    @Input()
    showToolTip: boolean = true;
  
    @Input(`appTooltip`)
    text: string = '';
  
    @Input()
    appTooltipTemplate: TemplateRef<any> | null = null;
  
    private _overlayRef: OverlayRef | null = null;
  
    constructor(private _overlay: Overlay,
                private _overlayPositionBuilder: OverlayPositionBuilder,
                private _elementRef: ElementRef) { }
  
    ngOnInit() {
  
        if (!this.showToolTip) {
            return;
        }

        const positions = [
            new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' }, undefined, -8),
            new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }, undefined, 5)
        ];

        const positionStrategy = this._overlayPositionBuilder
            .flexibleConnectedTo(this._elementRef)
            .withPositions(positions);
    
        this._overlayRef = this._overlay.create({ positionStrategy});
    }
  
    @HostListener('mouseenter')
    show() {
  
      //attach the component if it has not already attached to the overlay
      if (this._overlayRef && !this._overlayRef.hasAttached()) {
        const tooltipRef: ComponentRef<AppTooltipComponent> = this._overlayRef.attach(new ComponentPortal(AppTooltipComponent));
        tooltipRef.instance.text = this.text;
        tooltipRef.instance.contentTemplate = this.appTooltipTemplate;
      }    
    }
  
    @HostListener('mouseleave')
    hide() {
      this.closeToolTip();
    }
  
    ngOnDestroy() {
      this.closeToolTip();
    }
  
    private closeToolTip() {
      if (this._overlayRef) {
        this._overlayRef.detach();
      }
    }
}