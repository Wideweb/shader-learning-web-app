import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModuleService } from 'src/app/services/module.service';
import { UserModuleProgressDto } from 'src/app/models/module.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'module-view',
  templateUrl: './module-view.component.html',
  styleUrls: ['./module-view.component.css'],
})
export class ModuleViewComponent implements OnInit {
  public model: UserModuleProgressDto | null = null;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private moduleService: ModuleService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['moduleId'];

    this.moduleService.getUserProgress(id).subscribe(model => {
      this.model = model;
    });
  }

  openTask(taskId: number) {
    this.router.navigate([`module/${this.model!.id}/training/${taskId}`]);
  }
}
