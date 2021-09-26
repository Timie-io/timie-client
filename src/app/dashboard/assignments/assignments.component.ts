import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Assignment } from './../../_models/assignment.model';
import { Status } from './../../_models/status.model';
import { AuthService } from './../../_services/auth.service';
import { UpdateAssignmentGQL } from './../../_services/graphql/assignments-mutation.graphql';
import {
  AssignmentsGQL,
  AssignmentsResponse,
} from './../../_services/graphql/assignments-query.graphql';
import {
  CreateEntryGQL,
  NewEntryInput,
  StartEntryGQL,
} from './../../_services/graphql/entries-mutation.graphql';
import { StatusOptionsGQL } from './../../_services/graphql/status-query.graphql';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css'],
})
export class AssignmentsComponent implements OnInit, OnDestroy {
  error = '';

  assignmentsQuery: QueryRef<AssignmentsResponse>;
  assignments: Assignment[] = [];
  allStatus: Status[] = [];

  total = 0;

  private userId?: string;
  private currentUserSubscription?: Subscription;

  statusSelected: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly assignmentsGQL: AssignmentsGQL,
    private readonly statusOptionsGQL: StatusOptionsGQL,
    private readonly updateAssignmentGQL: UpdateAssignmentGQL,
    private readonly createEntryGQL: CreateEntryGQL,
    private readonly startEntryGQL: StartEntryGQL
  ) {
    this.assignmentsQuery = this.assignmentsGQL.watch();
  }

  ngOnInit(): void {
    this.assignmentsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.assignments.total;
      this.assignments = data.assignments.result;
    });
    this.currentUserSubscription = this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.applyFilters();
      }
    });
    this.statusOptionsGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.allStatus = data.statuses;
      });
  }

  ngOnDestroy() {
    this.currentUserSubscription?.unsubscribe();
  }

  private applyFilters() {
    const variables: { [id: string]: any } = { userId: this.userId };
    if (this.statusSelected) {
      variables['statusCode'] = this.statusSelected;
    }
    this.assignmentsQuery.setVariables(variables);
    this.assignmentsQuery.refetch();
  }

  onStatusChange(statusCode: string, assignment: Assignment) {
    this.updateAssignmentGQL
      .mutate({
        id: assignment.id,
        data: {
          statusCode: statusCode,
        },
      })
      .subscribe();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  private newEntryInput(assignmentId: string): NewEntryInput {
    const userId = this.authService.user?.id || '';
    if (!userId) {
      this.error = 'Unexpected error';
    }
    return {
      userId: userId,
      assignmentId: assignmentId,
    };
  }

  startNewEntry(assignment: Assignment) {
    this.createEntryGQL
      .mutate({ data: this.newEntryInput(assignment.id) })
      .subscribe({
        next: ({ data }) => {
          this.startEntryGQL.mutate({ id: data?.createEntry.id }).subscribe({
            next: () => {
              this.router.navigate(['/entries']);
            },
          });
        },
        error: (error) => {
          this.error = error;
        },
      });
  }
}
