import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModuleService } from 'src/app/services/module.service';
import { ModuleDto } from 'src/app/models/module.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit {
  public model: ModuleDto | null = null;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private moduleService: ModuleService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['moduleId'];

    this.moduleService.get(id).subscribe(model => {
      this.model = model;
    })
  }
}
