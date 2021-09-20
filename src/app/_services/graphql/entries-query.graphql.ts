import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Entry } from './../../_models/entry.model';

export interface EntriesResult {
  total: number;
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
    query GetEntries($skip: Int = 0, $take: Int = 25, $assignmentId: ID) {
      entries(skip: $skip, take: $take, assignmentId: $assignmentId) {
        total
        result {
          id
          startTime
          finishTime
          assignment {
            id
          }
        }
      }
    }
  `;
}
