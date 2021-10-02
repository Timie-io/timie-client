import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { first } from 'rxjs/operators';
import { AssignmentView } from '../_models/assignment-view.model';
import { Status } from '../_models/status.model';
import { AuthService } from './auth.service';
import {
  AssignmentsViewGQL,
  AssignmentsViewResponse,
} from './graphql/assignments-query.graphql';
import {
  AssignmentAddedGQL,
  AssignmentRemovedGQL,
} from './graphql/assignments-subscription.graphql';
import { StatusOptionsGQL } from './graphql/status-query.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class AssignmentsService {
  private assignmentsQuery: QueryRef<AssignmentsViewResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  assignments: AssignmentView[] = [];
  allStatus: Status[] = [];

  userId?: string;
  statusSelected: string = '';

  search = '';

  constructor(
    private readonly authService: AuthService,
    private readonly assignmentsViewGQL: AssignmentsViewGQL,
    private readonly statusOptionsGQL: StatusOptionsGQL,
    private readonly assignmentAddedGQL: AssignmentAddedGQL,
    private readonly assignmentRemovedGQL: AssignmentRemovedGQL,
    private readonly sortService: SortService
  ) {
    this.assignmentsQuery = this.assignmentsViewGQL.watch(this.filters);
    this.assignmentsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.assignmentsView.total;
      this.assignments = data.assignmentsView.result;
    });
    this.statusOptionsGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.allStatus = data.statuses;
      });
    this.authService.user$.subscribe((user) => {
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
    filters['search'] = this.search || undefined;
    filters['userId'] = this.userId;
    filters['statusCode'] = this.statusSelected || undefined;
    const sortOptions = this.sortService.getSortOptions('assignments');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
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
