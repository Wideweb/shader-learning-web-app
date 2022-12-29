import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Subject } from 'rxjs';
import { ModuleService } from 'src/app/services/module.service';
import { UserModuleProgressDto } from 'src/app/models/module.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserTask } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'module-training',
  templateUrl: './module-training.component.html',
  styleUrls: ['./module-training.component.css']
})
export class ModuleTrainingComponent implements OnInit, OnDestroy {
  public module: UserModuleProgressDto | null = null;

  public userTask: UserTask | null = null;

  public isEnd = false;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private moduleService: ModuleService, private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const taskId$ = this.route.params.pipe(
      map(params => params['taskId']),
      distinctUntilChanged(),
    );

    const moduleId = this.route.snapshot.params['moduleId'];
    this.moduleService.getUserProgress(moduleId).subscribe(module => {
      this.module = module;
      taskId$.subscribe(taskId => taskId ? this.loadTask(taskId) : this.nextTask());
    });
  }

  nextTask() {
    const nextTaskId = this.findNextTaskId();
    if (!nextTaskId) {
      this.isEnd = true;
      return;
    }

    this.router.navigate([`module/${this.module!.id}/training/${nextTaskId}`]);
  }

  findNextTaskId(): number | null {
    if (!!this.userTask) {
      const nextTask = this.module?.tasks.find(task => !task.accepted && task.order > this.userTask!.task.order);
      if (nextTask) {
        return nextTask.id;
      }
    }

    const nextTask = this.module?.tasks.find(task => !task.accepted);
    return nextTask ? nextTask.id : null;
  }

  loadTask(taskId: number) {
    this.loaded$.next(false);
    this.userTask = null;
    this.taskService.getUserTask(taskId).subscribe(userTask => {
      this.userTask = userTask;
      this.loaded$.next(true);
    });
  }

  acceptTask() {
    const task = this.module?.tasks.find(task => task.id == this.userTask?.task.id);
    task!.accepted = true;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
