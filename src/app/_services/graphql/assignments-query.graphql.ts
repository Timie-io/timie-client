import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Assignment } from './../../_models/assignment.model';
import { Entry } from './../../_models/entry.model';

export interface AssignmentsResult {
  total: number;
  result: Assignment[];
}

export interface AssignmentEntriesResult {
  id: string;
  entries: Entry[];
}

export interface AssignmentsResponse {
  assignments: AssignmentsResult;
}

export interface AssignmentEntriesResponse {
  assignment: AssignmentEntriesResult;
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
      $statusCode: ID
    ) {
      assignments(
        skip: $skip
        take: $take
        userId: $userId
        taskId: $taskId
        statusCode: $statusCode
      ) {
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
            title
          }
          status {
            code
            label
          }
          totalTime
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentEntriesGQL extends Query<AssignmentEntriesResponse> {
  document = gql`
    query GetAssignmentEntries($id: ID!) {
      assignment(id: $id) {
        id
        entries {
          id
          startTime
          finishTime
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentOptionsGQL extends Query<AssignmentsResponse> {
  document = gql`
    query GetAssignments(
      $skip: Int = 0
      $take: Int = 25
      $userId: ID
      $taskId: ID
      $statusCode: ID
    ) {
      assignments(
        skip: $skip
        take: $take
        userId: $userId
        taskId: $taskId
        statusCode: $statusCode
      ) {
        total
        result {
          id
          note
        }
      }
    }
  `;
}
