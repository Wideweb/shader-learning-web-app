import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Router} from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleListState } from '../../state/module-list.state';
import { ModuleListLoad } from '../../state/module-list.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { API } from 'src/environments/environment';
import { ModuleListCardModel } from '../module-list-card/module-list-card.component';

@Component({
  selector: 'module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.scss']
})
export class ModuleListComponent implements OnInit {

  public modules$: Observable<ModuleListCardModel[]>;

  @Select(ModuleListState.loaded)
  public loaded$!: Observable<boolean>;

  public placeholders = [...Array(30).keys()];

  constructor(private store: Store, private router: Router, private pageMeta: PageMetaService) {
    this.modules$ = this.store.select(ModuleListState.list).pipe(map(data => data.map(module=> ({
      title: module.name,
      body: module.description,
      label: module.tasks + (module.tasks == 1 ? ' task' : ' tasks'),
      link: `/module-view/${module.id}`,
      imageSrc: `${API}/modules/${module.id}/cover`,
    }))));
  }

  ngOnInit(): void {
    this.store.dispatch(new ModuleListLoad());
    this.pageMeta.setTitle('Explore');
    this.pageMeta.setDescription(`Solve problems on any topic you are interested in, whether it's working with light, water rendering or study the built-in functions of the graphics language.`);
  }

  createNew(): void {
    this.router.navigate(['/module']);
  }
}
