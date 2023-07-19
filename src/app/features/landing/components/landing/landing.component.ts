import { AfterViewInit, Component, HostListener, NgZone, OnInit } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { CarouselCardModel } from './carousel/carousel-card/carousel-card.component';
import { FeedbackCardModel } from './feedback/feedback-card/feedback-card.component';
import { Select, Store } from '@ngxs/store';
import { ModulesLoad } from '../../state/modules.actions';
import { ModulesState } from '../../state/modules.state';
import { Observable, map } from 'rxjs';
import { FeedbackState } from '../../state/feedback.state';
import { FeedbackLoad } from '../../state/feedback.actions';
import { API } from 'src/environments/environment';
import { ComponentSize } from '../../constants';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {

  @Select(ModulesState.loaded)
  public modulesLoaded$!: Observable<boolean>;

  public modules$: Observable<CarouselCardModel[]>;

  @Select(FeedbackState.loaded)
  public feedbackLoaded$!: Observable<boolean>;

  @Select(FeedbackState.list)
  public feedback$!: Observable<FeedbackCardModel[]>;

  public size = ComponentSize.Big;

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  get isMedium() {
    return this.size === ComponentSize.Medium;
  }

  get isBig() {
    return this.size === ComponentSize.Big;
  }

  constructor(private pageMeta: PageMetaService, private store: Store, private ngZone: NgZone) {
    this.modules$ = this.store.select(ModulesState.list).pipe(map(data => data.map(module=> ({
      title: module.name,
      body: module.description,
      label: module.tasks + (module.tasks == 1 ? ' task' : ' tasks'),
      link: `/module-view/${module.id}`,
      imageSrc: `${API}/modules/${module.id}/cover`,
    }))));
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize();
  }

  ngAfterViewInit(): void {
    this.ngZone.run(() => this.resize());
  }

  ngOnInit(): void {
    this.pageMeta.setDefaultTitle();
    this.pageMeta.setDefaultDescription();

    this.store.dispatch([new ModulesLoad(), new FeedbackLoad()]);
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
