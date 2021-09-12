import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Team } from '../../../_models/team.model';

export interface AllTeamsResult {
  total: number;
  result: Team[];
}

export interface AllTeamsResponse {
  teams: AllTeamsResult;
}

export interface AllTeamsArgs {
  skip: number;
  take: number;
  name: string;
  ownerId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AllTeamsGQL extends Query<AllTeamsResponse> {
  document = gql`
    query AllTeams(
      $skip: Int = 0
      $take: Int = 25
      $name: String
      $ownerId: ID
    ) {
      teams(skip: $skip, take: $take, name: $name, ownerId: $ownerId) {
        total
        result {
          id
          name
          description
          owner {
            email
            name
          }
        }
      }
    }
  `;
}
