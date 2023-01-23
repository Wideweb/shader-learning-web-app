import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressState } from '../../state/module-progress.state';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'module-view',
  templateUrl: './module-view.component.html',
  styleUrls: ['./module-view.component.css'],
})
export class ModuleViewComponent implements OnInit, OnDestroy {

  @Select(ModuleProgressState.module)
  public module$!: Observable<ModuleProgressDto>;

  @Select(ModuleProgressState.loaded)
  public loaded$!: Observable<boolean>;

  public module: ModuleProgressDto | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private pageMeta: PageMetaService) { }

  ngOnInit(): void {
    this.module$.pipe(takeUntil(this.destroy$)).subscribe(module => (this.module = module));

    this.module$.pipe(takeUntil(this.destroy$)).subscribe(module => {
      this.pageMeta.setTitle(module?.name);
      this.pageMeta.setDescription(module?.description);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
