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

@Injectable({
  providedIn: 'root',
})
export class AllTeamsGQL extends Query<AllTeamsResponse> {
  document = gql`
    query AllTeams {
      teams {
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
