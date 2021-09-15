import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { Project } from './../../../_models/project.model';
import { ProjectsOptionGQL } from './../../../_services/graphql/projects-query.graphql';
import {
  CreateTaskGQL,
  NewTaskInput,
  UpdateTaskGQL,
  UpdateTaskInput,
} from './../graphql/tasks-mutation.graphql';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css'],
})
export class TaskModalComponent implements OnInit {
  @Input() id?: string;
  @Input() title?: string;
  @Input() description?: string;
  @Input() priority?: number = 0;
  @Input() active?: boolean = true;
  @Input() projectId?: string;

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  projects: Project[] = [];

  constructor(
    public modal: NgbActiveModal,
    private readonly formBuilder: FormBuilder,
    private readonly projectsOptionGQL: ProjectsOptionGQL,
    private readonly updateTaskGQL: UpdateTaskGQL,
    private readonly createTaskGQL: CreateTaskGQL
  ) {
    this.form = formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: [
        0,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      active: [true, Validators.required],
      projectId: ['', Validators.required],
    });
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form.controls.title.setValue(this.title);
    this.form.controls.description.setValue(this.description);
    this.form.controls.priority.setValue(this.priority);
    this.form.controls.active.setValue(this.active);
    this.form.controls.projectId.setValue(this.projectId || '');

    this.projectsOptionGQL.watch().valueChanges.subscribe(({ data }) => {
      this.projects = data.projects.result;
    });
  }

  private get updateTaskInput(): UpdateTaskInput {
    return {
      title: this.form.controls.title.value,
      description: this.form.controls.description.value,
      priority: this.form.controls.priority.value,
      active: this.form.controls.active.value,
    };
  }

  private get newTaskInput(): NewTaskInput {
    return {
      title: this.form.controls.title.value,
      description: this.form.controls.description.value,
      priority: this.form.controls.priority.value,
      active: this.form.controls.active.value,
      projectId: this.form.controls.projectId.value || undefined,
    };
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    if (this.id) {
      this.loading = true;
      this.updateTaskGQL
        .mutate({ id: this.id, data: this.updateTaskInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Team saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    } else {
      this.loading = true;
      this.createTaskGQL
        .mutate({ data: this.newTaskInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Team saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    }
  }
}
