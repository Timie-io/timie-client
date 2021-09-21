import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Entry } from './../../_models/entry.model';

export interface EntriesResult {
  total: number;
  totalTime: number;
  result: Entry[];
}

export interface EntriesResponse {
  entries: EntriesResult;
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
            }
          }
        }
      }
    }
  `;
}
