import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router} from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleListState } from '../../state/module-list.state';
import { ModuleListDto } from '../../models/module-list.model';
import { ModuleListLoad } from '../../state/module-list.actions';

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

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
    this.store.dispatch(new ModuleListLoad());
  }

  createNew(): void {
    this.router.navigate(['/module-create']);
  }
}
