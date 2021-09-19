import { Component, OnDestroy, OnInit } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { Assignment } from './../../_models/assignment.model';
import { AuthService } from './../../_services/auth.service';
import {
  AssignmentsGQL,
  AssignmentsResponse,
} from './../../_services/graphql/assignments-query.graphql';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css'],
})
export class AssignmentsComponent implements OnInit, OnDestroy {
  error = '';

  assignmentsQuery: QueryRef<AssignmentsResponse>;
  assignments: Assignment[] = [];

  total = 0;

  private currentUserSubscription?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly assignmentsGQL: AssignmentsGQL
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
        this.assignmentsQuery.setVariables({ userId: user.id });
        this.assignmentsQuery.refetch();
      }
    });
  }

  ngOnDestroy() {
    this.currentUserSubscription?.unsubscribe();
  }

  private applyFilters() {}

  onPageChange() {
    this.applyFilters();
  }
}
