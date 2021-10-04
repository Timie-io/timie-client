import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { AssignmentView } from '../../_models/assignment-view.model';
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

export interface AssignmentsViewResult {
  total: number;
  result: AssignmentView[];
}

export interface AssignmentsResponse {
  assignments: AssignmentsResult;
}

export interface AssignmentsViewResponse {
  assignmentsView: AssignmentsViewResult;
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
export class AssignmentsViewGQL extends Query<AssignmentsViewResponse> {
  document = gql`
    query AssignmentsView(
      $skip: Int = 0
      $take: Int = 25
      $search: String
      $creatorId: ID
      $userId: ID
      $taskId: ID
      $projectId: ID
      $statusCode: ID
      $sortBy: [SortInput]
    ) {
      assignmentsView(
        skip: $skip
        take: $take
        search: $search
        creatorId: $creatorId
        userId: $userId
        taskId: $taskId
        projectId: $projectId
        statusCode: $statusCode
        sortBy: $sortBy
      ) {
        total
        result {
          id
          creatorId
          creatorName
          created
          userId
          userName
          taskId
          taskTitle
          projectId
          projectName
          note
          deadline
          statusCode
          statusLabel
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
          task {
            id
            title
          }
        }
      }
    }
  `;
}
