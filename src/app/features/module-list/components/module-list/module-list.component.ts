import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router} from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleListState } from '../../state/module-list.state';
import { ModuleListDto } from '../../models/module-list.model';
import { ModuleListLoad } from '../../state/module-list.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit {

  @Select(ModuleListState.list)
  public modules$!: Observable<ModuleListDto[]>;

  @Select(ModuleListState.loaded)
  public loaded$!: Observable<ModuleListDto[]>;

  constructor(private store: Store, private router: Router, private pageMeta: PageMetaService) { }

  ngOnInit(): void {
    this.store.dispatch(new ModuleListLoad());
    this.pageMeta.setTitle('Explore');
    this.pageMeta.setDescription(`Solve problems on any topic you are interested in, whether it's working with light, water rendering or study the built-in functions of the graphics language.`);
  }

  createNew(): void {
    this.router.navigate(['/module']);
  }
}
