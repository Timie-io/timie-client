import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { EntryView } from '../../_models/entry-view.model';
import { Entry } from './../../_models/entry.model';

export interface EntriesResult {
  total: number;
  totalTime: number;
  result: Entry[];
}

export interface EntriesResponse {
  entries: EntriesResult;
}

export interface EntriesViewResult {
  total: number;
  totalTime: number;
  result: EntryView[];
}

export interface EntriesViewResponse {
  entriesView: EntriesViewResult;
}

@Injectable({
  providedIn: 'root',
})
export class EntriesGQL extends Query<EntriesResponse> {
  document = gql`
    query GetEntries(
      $skip: Int = 0
      $take: Int = 25
      $userId: ID
      $assignmentId: ID
      $note: String
    ) {
      entries(
        skip: $skip
        take: $take
        userId: $userId
        assignmentId: $assignmentId
        note: $note
      ) {
        total
        totalTime
        result {
          id
          startTime
          finishTime
          note
          user {
            id
            name
          }
          assignment {
            id
            note
            task {
              id
              title
            }
          }
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class EntriesViewGQL extends Query<EntriesViewResponse> {
  document = gql`
    query EntriesView(
      $skip: Int = 0
      $take: Int = 25
      $search: String
      $userId: ID
      $assignmentId: ID
      $taskId: ID
      $projectId: ID
      $sortBy: [SortInput]
    ) {
      entriesView(
        skip: $skip
        take: $take
        search: $search
        userId: $userId
        assignmentId: $assignmentId
        taskId: $taskId
        projectId: $projectId
        sortBy: $sortBy
      ) {
        total
        result {
          id
          startTime
          finishTime
          note
          userId
          userName
          assignmentId
          assignmentNote
          taskId
          taskTitle
          projectId
          projectName
          totalTime
        }
        totalTime
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class EntriesOnlyGQL extends Query<EntriesResponse> {
  // Simplified version with only the entries data
  document = gql`
    query GetEntriesOnly(
      $skip: Int = 0
      $take: Int = 25
      $userId: ID
      $assignmentId: ID
      $note: String
    ) {
      entries(
        skip: $skip
        take: $take
        userId: $userId
        assignmentId: $assignmentId
        note: $note
      ) {
        total
        totalTime
        result {
          id
          startTime
          finishTime
          note
        }
      }
    }
  `;
}
