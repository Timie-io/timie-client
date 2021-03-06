import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { EntriesService } from '../../../_services/entries.service';
import { fixTimeGap } from '../../../_utils/date.convert';
import { Assignment } from './../../../_models/assignment.model';
import { AppService } from './../../../_services/app.service';
import { AuthService } from './../../../_services/auth.service';
import {
  AssignmentOptionsGQL,
  AssignmentsResponse,
} from './../../../_services/graphql/assignments-query.graphql';
import {
  CreateEntryGQL,
  NewEntryInput,
} from './../../../_services/graphql/entries-mutation.graphql';

@Component({
  selector: 'app-entry-modal',
  templateUrl: './entry-modal.component.html',
  styleUrls: ['./entry-modal.component.css'],
})
export class EntryModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  assignments: Assignment[] = [];

  private assignmentOptionsQuery: QueryRef<AssignmentsResponse>;
  private currentUserSub: Subscription;

  constructor(
    public modal: NgbActiveModal,
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly appService: AppService,
    private readonly entriesService: EntriesService,
    private readonly assignmentOptionsGQL: AssignmentOptionsGQL,
    private readonly createEntryGQL: CreateEntryGQL
  ) {
    this.form = formBuilder.group({
      startTime: [''],
      finishTime: ['', this.finishTimeValidator()],
      note: ['', Validators.maxLength(50)],
      assignmentId: [''],
    });
    this.assignmentOptionsQuery = this.assignmentOptionsGQL.watch();
    this.currentUserSub = this.authService.user$.subscribe((value) => {
      if (value) {
        this.assignmentOptionsQuery.setVariables({ userId: value.id });
      }
    });
  }

  ngOnInit(): void {
    this.refetchOptions();
  }

  ngOnDestroy() {
    this.currentUserSub.unsubscribe();
  }

  public get f() {
    return this.form.controls;
  }

  private refetchOptions() {
    this.assignmentOptionsQuery.setVariables({
      active: true,
      userId: this.authService.user?.id,
    });
    this.assignmentOptionsQuery.refetch().then(({ data }) => {
      this.assignments = data.assignments.result;
    });
  }

  private finishTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && this.f.startTime.value) {
        const startTime = new Date(this.f.startTime.value);
        const finishTime = new Date(control.value);
        if (Number(startTime) > Number(finishTime)) {
          return { tooEarly: true };
        }
      }
      return null;
    };
  }

  private get newEntryInput(): NewEntryInput {
    return {
      startTime: fixTimeGap(this.form.controls.startTime.value || undefined),
      finishTime: fixTimeGap(this.form.controls.finishTime.value || undefined),
      note: this.form.controls.note.value || undefined,
      assignmentId: this.form.controls.assignmentId.value || undefined,
    };
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    this.loading = true;
    this.createEntryGQL.mutate({ data: this.newEntryInput }).subscribe({
      next: ({ data }) => {
        this.modal.close('Entry saved');
        const entry = data?.createEntry;
        if (entry && !entry.startTime) {
          this.entriesService.startEntry$(entry.id).subscribe({
            next: () => {
              this.appService.setRunning();
            },
          });
        }
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      },
    });
  }
}
