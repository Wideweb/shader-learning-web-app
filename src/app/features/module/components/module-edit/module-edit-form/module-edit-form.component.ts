import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ModuleDto } from '../../../models/module.model';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ModuleEditDescriptionBegin, ModuleEditDescriptionCancel, ModuleEditNameBegin, ModuleEditNameCancel } from '../../../state/module.actions';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'module-edit-form',
  templateUrl: './module-edit-form.component.html',
  styleUrls: ['./module-edit-form.component.css']
})
export class ModuleEditFormComponent implements OnChanges {

  @Input()
  public isNameEditActive = false;

  @Input()
  public isDescriptionEditActive = false;

  @Input()
  public module: ModuleDto | null = null;
  
  @Input()
  public error: any;

  @Output()
  public onModuleNameSave = new EventEmitter<string>();

  @Output()
  public onModuleDescriptionSave = new EventEmitter<string>();

  @Output()
  public onToggleLock = new EventEmitter<void>();

  @Output()
  public onEditTask = new EventEmitter<number>();

  @Output()
  public onToggleTaskVisibility = new EventEmitter<number>();

  @Output()
  public onReorderTasks = new EventEmitter<{ oldOrder: number, newOrder: number }>();

  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  public compiledMarkdown: string = '';

  constructor(private fb: FormBuilder, private store: Store) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      locked: false,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('module' in changes) {
      this.form.patchValue({
        name: this.module?.name,
        description: this.module?.description,
        locked: this.module?.locked,
      });
    }

    if ('error' in changes && this.error?.error?.code == 'MODULE_NAME_NOT_UNIQUE') {
        this.form.controls['name'].setErrors({'MODULE_NAME_NOT_UNIQUE': true});
    }
  }

  startNameEdit() {
    this.store.dispatch(new ModuleEditNameBegin());
  }

  saveName() {
    this.onModuleNameSave.emit(this.form.get('name')?.value);
  }

  cancelNameEdit() {
    this.form.patchValue({
      name: this.module?.name,
    });
    this.store.dispatch(new ModuleEditNameCancel());
  }

  startDescriptionEdit() {
    this.store.dispatch(new ModuleEditDescriptionBegin());
  }

  saveDescription() {
    this.onModuleDescriptionSave.emit(this.form.get('description')?.value);
  }

  cancelDescriptionEdit() {
    this.form.patchValue({
      description: this.module?.description,
    });
    this.store.dispatch(new ModuleEditDescriptionCancel());
  }

  togglLock() {
    this.onToggleLock.emit();
  }

  reorderTasks(event: { oldOrder: number, newOrder: number }) {
    this.onReorderTasks.emit(event);
  }

  editTask(taskId: number) {
    this.onEditTask.emit(taskId);
  }

  toggleTaskVisibility(taskId: number) {
    this.onToggleTaskVisibility.emit(taskId);
  }
}
