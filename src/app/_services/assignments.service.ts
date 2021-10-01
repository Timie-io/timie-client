import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Assignment } from '../_models/assignment.model';
import { Status } from '../_models/status.model';
import { AuthService } from './auth.service';
import {
  AssignmentsGQL,
  AssignmentsResponse,
} from './graphql/assignments-query.graphql';
import {
  AssignmentAddedGQL,
  AssignmentRemovedGQL,
} from './graphql/assignments-subscription.graphql';
import { StatusOptionsGQL } from './graphql/status-query.graphql';

@Injectable({
  providedIn: 'root',
})
export class AssignmentsService {
  private currentUserSubscription?: Subscription;

  private assignmentsQuery: QueryRef<AssignmentsResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  assignments: Assignment[] = [];
  allStatus: Status[] = [];

  userId?: string;
  statusSelected: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly assignmentsGQL: AssignmentsGQL,
    private readonly statusOptionsGQL: StatusOptionsGQL,
    private readonly assignmentAddedGQL: AssignmentAddedGQL,
    private readonly assignmentRemovedGQL: AssignmentRemovedGQL
  ) {
    this.assignmentsQuery = this.assignmentsGQL.watch(this.filters);
    this.assignmentsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.assignments.total;
      this.assignments = data.assignments.result;
    });
    this.statusOptionsGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.allStatus = data.statuses;
      });
    this.currentUserSubscription = this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.applyFilters();
        this.unsubscribeAdded = this.subscribeToAssignmentAdded();
        this.unsubscribeRemoved = this.subscribeToAssignmentRemoved();
      }
    });
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    filters['userId'] = this.userId;
    filters['statusCode'] = this.statusSelected || undefined;
    return filters;
  }

  applyFilters() {
    this.assignmentsQuery.setVariables(this.filters);
    this.assignmentsQuery.refetch();
  }

  private subscribeToAssignmentAdded() {
    this.unsubscribeAdded();
    return this.assignmentsQuery.subscribeToMore({
      document: this.assignmentAddedGQL.document,
      variables: {
        input: {
          userId: this.userId,
        },
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        this.assignmentsQuery.refetch();
        return prev;
      },
    });
  }

  private subscribeToAssignmentRemoved() {
    this.unsubscribeRemoved();
    return this.assignmentsQuery.subscribeToMore({
      document: this.assignmentRemovedGQL.document,
      variables: {
        input: {
          userId: this.userId,
        },
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        this.assignmentsQuery.refetch();
        return prev;
      },
    });
  }
}
