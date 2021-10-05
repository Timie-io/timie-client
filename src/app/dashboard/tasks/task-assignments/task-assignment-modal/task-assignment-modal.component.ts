import { formatDate } from '@angular/common';
import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { fixTimeGap } from '../../../../_utils/date.convert';
import { Status } from './../../../../_models/status.model';
import { User } from './../../../../_models/user.model';
import {
  CreateAssignmentGQL,
  NewAssignmentInput,
  UpdateAssignmentGQL,
  UpdateAssignmentInput,
} from './../../../../_services/graphql/assignments-mutation.graphql';
import { StatusOptionsGQL } from './../../../../_services/graphql/status-query.graphql';
import { AllUsersQueryGQL } from './../../../../_services/graphql/users-query.graphql';

@Component({
  selector: 'app-task-assignment-modal',
  templateUrl: './task-assignment-modal.component.html',
  styleUrls: ['./task-assignment-modal.component.css'],
})
export class TaskAssignmentModalComponent implements OnInit {
  @Input() id?: string;
  @Input() taskId?: string;
  @Input() userId?: string;
  @Input() note?: string;
  @Input() deadline?: string;
  @Input() statusCode?: string;

  today?: Date;
  allUsers?: User[];
  allStatus?: Status[];

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    formBuilder: FormBuilder,
    @Inject(LOCALE_ID) public locale: string,
    public modal: NgbActiveModal,
    private readonly allUsersGQL: AllUsersQueryGQL,
    private readonly statusOptionsGQL: StatusOptionsGQL,
    private readonly createAssignmentGQL: CreateAssignmentGQL,
    private readonly updateAssignmentGQL: UpdateAssignmentGQL
  ) {
    this.form = formBuilder.group({
      taskId: ['', Validators.required],
      userId: ['', Validators.required],
      note: ['', Validators.maxLength(90)],
      deadline: [''],
      statusCode: ['', Validators.required],
    });
  }

  private fetchStatusOptions() {
    this.statusOptionsGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.allStatus = data.statuses;
        if (!this.form.controls.statusCode.value) {
          this.form.controls.statusCode.setValue(this.allStatus[0].code);
        }
      });
  }

  private fetchAllUsers() {
    this.allUsersGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.allUsers = data.users;
      });
  }

  ngOnInit(): void {
    if (!this.taskId) {
      this.error = 'No task specified';
    }
    this.today = new Date();
    this.fetchAllUsers();
    this.fetchStatusOptions();
    this.form.controls.taskId.setValue(this.taskId);
    this.form.controls.userId.setValue(this.userId || '');
    this.form.controls.note.setValue(this.note);
    if (this.deadline) {
      this.form.controls.deadline.setValue(
        formatDate(this.deadline, 'yyyy-MM-dd', this.locale)
      );
    }
    this.form.controls.statusCode.setValue(this.statusCode);
  }

  get f() {
    return this.form.controls;
  }

  private get updateAssignmentInput(): UpdateAssignmentInput {
    return {
      note: this.form.controls.note.value,
      deadline: fixTimeGap(
        this.form.controls.deadline.value || undefined,
        true
      ),
      userId: this.form.controls.userId.value,
      statusCode: this.form.controls.statusCode.value,
    };
  }

  private get newAssignmentInput(): NewAssignmentInput {
    return {
      taskId: this.taskId || '',
      note: this.form.controls.note.value,
      deadline: fixTimeGap(
        this.form.controls.deadline.value || undefined,
        true
      ),
      userId: this.form.controls.userId.value,
      statusCode: this.form.controls.statusCode.value,
    };
  }

  onSubmit() {
    this.submitted = true;
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    if (this.id) {
      this.loading = true;
      this.updateAssignmentGQL
        .mutate({ id: this.id, data: this.updateAssignmentInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Assignment saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    } else {
      this.loading = true;
      this.createAssignmentGQL
        .mutate({ data: this.newAssignmentInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Assignment saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    }
  }
}
