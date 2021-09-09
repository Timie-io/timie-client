import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Team } from '../../../_models/team.model';

export interface Result {
  total: number;
  result: Team[];
}

export interface Response {
  teams: Result;
}

@Injectable({
  providedIn: 'root',
})
export class AllTeamsGQL extends Query<Response> {
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
