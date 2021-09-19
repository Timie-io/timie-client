import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Assignment } from './../../_models/assignment.model';

export interface AssignmentsResult {
  total: number;
  result: Assignment[];
}

export interface AssignmentsResponse {
  assignments: AssignmentsResult;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentsGQL extends Query<AssignmentsResponse> {
  document = gql`
    query GetAssignments(
      $skip: Int = 0
      $take: Int = 25
      $userId: ID
      $taskId: ID
    ) {
      assignments(skip: $skip, take: $take, userId: $userId, taskId: $taskId) {
        total
        result {
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
        }
      }
    }
  `;
}
