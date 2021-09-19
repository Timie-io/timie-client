import { Component, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Assignment } from './../../../_models/assignment.model';
import { RemoveAssignmentGQL } from './../../../_services/graphql/assignments-mutation.graphql';
import {
  AssignmentsGQL,
  AssignmentsResponse,
} from './../../../_services/graphql/assignments-query.graphql';
import {
  AssignmentAddedGQL,
  AssignmentRemovedGQL,
  AssignmentSubscriptionInput,
} from './../../../_services/graphql/assignments-subscription.graphql';
import { TaskAssignmentModalComponent } from './task-assignment-modal/task-assignment-modal.component';

@Component({
  selector: 'app-task-assignments',
  templateUrl: './task-assignments.component.html',
  styleUrls: ['./task-assignments.component.css'],
})
export class TaskAssignmentsComponent implements OnInit {
  @Input() taskId: string | null = null;

  error = '';

  assignments: Assignment[] = [];

  private assignmentsQuery: QueryRef<AssignmentsResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private readonly modalService: NgbModal,
    private readonly assignmentsGQL: AssignmentsGQL,
    private readonly removeAssignmentGQL: RemoveAssignmentGQL,
    private readonly assignmentAddedGQL: AssignmentAddedGQL,
    private readonly assignmentRemovedGQL: AssignmentRemovedGQL
  ) {
    this.assignmentsQuery = this.assignmentsGQL.watch();
  }

  ngOnInit(): void {
    this.assignmentsQuery.setVariables({ taskId: this.taskId });
    this.assignmentsQuery.refetch();
    this.assignmentsQuery.valueChanges.subscribe(({ data }) => {
      this.assignments = data.assignments.result;
    });
    this.unsubscribeAdded = this.subscribeToAssignmentAdded(
      this.subscriptionInput
    );
    this.unsubscribeRemoved = this.subscribeToAssignmentRemoved(
      this.subscriptionInput
    );
  }

  newAssignment() {
    const modal = this.modalService.open(TaskAssignmentModalComponent);
    modal.componentInstance.taskId = this.taskId;
  }

  editAssignment(assignment: Assignment) {
    const modal = this.modalService.open(TaskAssignmentModalComponent);
    modal.componentInstance.id = assignment.id;
    modal.componentInstance.taskId = this.taskId;
    modal.componentInstance.userId = assignment.user.id;
    modal.componentInstance.note = assignment.note;
    modal.componentInstance.deadline = assignment.deadline;
    modal.componentInstance.statusCode = assignment.status.code;
  }

  removeAssignment(assignment: Assignment) {
    if (confirm('Are you sure about removing this assignment?')) {
      this.removeAssignmentGQL.mutate({ id: assignment.id }).subscribe({
        next: () => {
          this.error = '';
        },
        error: (error) => {
          if (
            error.message.includes(
              'violates foreign key constraint',
              'on table "entry"'
            )
          ) {
            this.error = 'This assignment contains entries';
          } else {
            this.error = error;
          }
        },
      });
    }
  }

  private get subscriptionInput(): AssignmentSubscriptionInput {
    const input = {
      taskId: this.taskId || undefined,
    };
    return input;
  }

  private subscribeToAssignmentAdded(input?: AssignmentSubscriptionInput) {
    this.unsubscribeAdded();
    return this.assignmentsQuery.subscribeToMore({
      document: this.assignmentAddedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const itemAdded = subscriptionData.data.assignmentAdded;

        return {
          ...prev,
          assignments: {
            __typename: 'AssignmentsResult',
            total: prev.assignments.total + 1,
            result: [itemAdded, ...prev.assignments.result],
          },
        };
      },
    });
  }

  private subscribeToAssignmentRemoved(input?: AssignmentSubscriptionInput) {
    this.unsubscribeRemoved();
    return this.assignmentsQuery.subscribeToMore({
      document: this.assignmentRemovedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const itemRemoved = subscriptionData.data.assignmentRemoved;
        const newList = prev.assignments.result.filter(
          (item) => item.id !== itemRemoved.id
        );

        return {
          ...prev,
          assignments: {
            __typename: 'AssignmentsResult',
            total: prev.assignments.total - 1,
            result: newList,
          },
        };
      },
    });
  }
}
