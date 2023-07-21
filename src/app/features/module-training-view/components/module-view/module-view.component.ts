import { AfterViewInit, Component, HostListener, Input, NgZone, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { ComponentSize } from 'src/app/features/landing/constants';
import { ModuleProgressDto } from 'src/app/features/module-training-common/models/module-progress.model';
import { API } from 'src/environments/environment';

@Component({
  selector: 'module-view',
  templateUrl: './module-view.component.html',
  styleUrls: ['./module-view.component.scss'],
})
export class ModuleViewComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  public module!: ModuleProgressDto;

  @Input()
  public finished: boolean = true;

  public started: boolean = false;

  public pageHeaderImageSrc = '';

  public size = ComponentSize.Big;

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  constructor(private pageMeta: PageMetaService, private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    this.ngZone.run(() => this.resize());
  }

  ngOnInit(): void {
    this.updateMetaData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('module' in changes) {
      this.updateMetaData();
      this.pageHeaderImageSrc = `${API}/modules/${this.module.id}/pageHeaderImage`;
    }
  }

  private updateMetaData(): void {
    this.started = this.module.tasks.some(t => t.accepted || t.rejected);
    this.pageMeta.setTitle(this.module.name);
    this.pageMeta.setDescription(this.module.description);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize();
  }

  resize(): void {
    if (window.innerWidth < 640) {
      this.size = ComponentSize.Small;
    } else if (window.innerWidth < 1024) {
      this.size = ComponentSize.Medium;
    } else {
      this.size = ComponentSize.Big;
    }
  }
}
