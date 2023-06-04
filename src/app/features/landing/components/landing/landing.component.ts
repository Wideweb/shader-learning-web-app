import { Component } from '@angular/core';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { CarouselCardModel } from './carousel/carousel-card/carousel-card.component';
import { FeedbackCardModel } from './feedback/feedback-card/feedback-card.component';
import { Select, Store } from '@ngxs/store';
import { ModulesLoad } from '../../state/modules.actions';
import { ModulesState } from '../../state/modules.state';
import { Observable, map } from 'rxjs';
import { FeedbackState } from '../../state/feedback.state';
import { FeedbackLoad } from '../../state/feedback.actions';

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  @Select(ModulesState.loaded)
  public modulesLoaded$!: Observable<boolean>;

  public modules$: Observable<CarouselCardModel[]>;

  @Select(FeedbackState.loaded)
  public feedbackLoaded$!: Observable<boolean>;

  @Select(FeedbackState.list)
  public feedback$!: Observable<FeedbackCardModel[]>;

  constructor(private pageMeta: PageMetaService, private store: Store) {
    this.modules$ = this.store.select(ModulesState.list).pipe(map(data => data.map(module=> ({
      title: module.name,
      body: module.description,
      label: module.tasks + (module.tasks == 1 ? ' task' : ' tasks'),
      link: `/module-progress/${module.id}/view`,
    }))));
  }

  public modules: CarouselCardModel[] = [
    {
      title: 'Built-in functions',
      body: 'Explore a large collection of built-in GLSL functions',
      label: '25 tasks',
      link: `/module-progress/1/view`,
    },
    {
      title: 'PostFX - Basic Color Manipulation',
      body: 'Learn how to change the brightness, saturation, contrast and other parameters of an image',
      label: '8 tasks',
      link: `/module-progress/1/view`,
    },
    {
      title: 'Lighting Basics',
      body: 'Study realistic mathematical lighting models',
      label: '14 tasks',
      link: `/module-progress/1/view`,
    },
    {
      title: 'Noise',
      body: 'Learn how to use the noise features to create visual effects like clouds, fire, wood, etc',
      label: '16 tasks',
      link: `/module-progress/1/view`,
    },
    {
      title: 'Vertex Transformations',
      body: 'Learn to transform objects in space by performing mathematical operations on their vertex data',
      label: '9 tasks',
      link: `/module-progress/1/view`,
    }
  ];

  // public feedback: FeedbackCardModel[] = [
  //   {
  //     authorName: 'Vladimir',
  //     authorTitle: 'programmer',
  //     body: `"”`
  //   },
  //   {
  //     authorName: 'Ella',
  //     authorTitle: 'programmer',
  //     body: `"I've been trying to learn shaders for a while now, but everything I found online was either too advanced or too basic. Shader Learning strikes the perfect balance and has helped me improve my skills immensely. Thank you!”`
  //   },
  //   {
  //     authorName: 'B1',
  //     authorTitle: 'programmer1',
  //     body: `B1`
  //   },
  //   {
  //     authorName: 'B2',
  //     authorTitle: 'programmer2',
  //     body: `B2`
  //   },
  //   {
  //     authorName: 'C1',
  //     authorTitle: 'programmer1',
  //     body: `C1`
  //   },
  //   {
  //     authorName: 'C2',
  //     authorTitle: 'programmer2',
  //     body: `C2`
  //   },
  //   {
  //     authorName: 'D1',
  //     authorTitle: 'programmer1',
  //     body: `D1`
  //   },
  //   {
  //     authorName: 'D2',
  //     authorTitle: 'programmer2',
  //     body: `D2`
  //   }
  // ];

  ngOnInit(): void {
    this.pageMeta.setDefaultTitle();
    this.pageMeta.setDefaultDescription();

    this.store.dispatch([new ModulesLoad(), new FeedbackLoad()]);
  }

  scrollTop() :void {
    document.querySelector('.page-scroll')?.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
}
