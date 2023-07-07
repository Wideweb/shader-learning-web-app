import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { ModuleProgressDto } from 'src/app/features/module-training/models/module-progress.model';

@Component({
  selector: 'module-view',
  templateUrl: './module-view.component.html',
  styleUrls: ['./module-view.component.scss'],
})
export class ModuleViewComponent implements OnInit, OnChanges {

  @Input()
  public module!: ModuleProgressDto;

  constructor(private pageMeta: PageMetaService) { }

  ngOnInit(): void {
    this.updateMetaData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('module' in changes) {
      this.updateMetaData();
    }
  }

  private updateMetaData(): void {
    this.pageMeta.setTitle(this.module.name);
    this.pageMeta.setDescription(this.module.description);
  }
}
