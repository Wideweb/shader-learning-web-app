import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermissionService } from 'src/app/services/permission.service';
import { ModuleService } from 'src/app/services/module.service';
import { ModuleListDto } from 'src/app/models/module.model';
import { Router} from '@angular/router';

@Component({
  selector: 'module-list',
  templateUrl: './module-list.component.html',
  styleUrls: ['./module-list.component.css']
})
export class ModuleListComponent implements OnInit {

  public modules: ModuleListDto[] = [];

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private moduleService: ModuleService, private permissions: PermissionService, private router: Router) { }

  ngOnInit(): void {
    this.moduleService.list().subscribe(modules => {
      this.modules = modules;
      this.loaded$.next(true);
    })
  }

  createNew(): void {
    this.router.navigate(['/module-create']);
  }
}
