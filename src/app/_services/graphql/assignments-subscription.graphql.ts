import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';
import { Assignment } from './../../_models/assignment.model';

export interface AssignmentAddedResponse {
  assignmentAdded: Assignment;
}

export interface AssignmentRemovedResponse {
  assignmentRemoved: Assignment;
}

export interface AssignmentSubscriptionInput {
  taskId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentAddedGQL extends Subscription<AssignmentAddedResponse> {
  document = gql`
    subscription AssignmentAdded($input: AssignmentAddedInput) {
      assignmentAdded(input: $input) {
        id
        note
        deadline
        creator {
          id
          name
          email
        }
        creationDate
        user {
          id
          name
          email
        }
        task {
          id
        }
        status {
          code
          label
        }
        totalTime
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentRemovedGQL extends Subscription<AssignmentRemovedResponse> {
  document = gql`
    subscription AssignmentRemoved($input: AssignmentAddedInput) {
      assignmentRemoved(input: $input) {
        id
      }
    }
  `;
}
