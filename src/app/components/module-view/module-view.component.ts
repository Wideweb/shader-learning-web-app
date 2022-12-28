import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModuleService } from 'src/app/services/module.service';
import { ModuleDto } from 'src/app/models/module.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'module-view',
  templateUrl: './module-view.component.html',
  styleUrls: ['./module-view.component.css']
})
export class ModuleViewComponent implements OnInit {
  public model: ModuleDto | null = null;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private moduleService: ModuleService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['moduleId'];

    this.moduleService.get(id).subscribe(model => {
      this.model = model;
    })
  }

  reorderTasks(event: { oldOrder: number, newOrder: number }) {
    this.moduleService.reorderTasks(this.model!.id, event.oldOrder, event.newOrder).subscribe(result => {
      if (!result) {
        this.model!.tasks = [...this.model!.tasks];
        return;
      }

      this.moduleService.taskList(this.model!.id).subscribe(tasks => {
        this.model!.tasks = tasks;
      });
    })
  }

  addTask() {
    this.router.navigate([`module/${this.model!.id}/task-create`]);
  }

  openTask(taskId: number) {
    this.router.navigate([`module/${this.model!.id}/training/${taskId}`]);
  }

  editTask(taskId: number) {
    this.router.navigate([`module/${this.model!.id}/task/${taskId}/edit`]);
  }
}
