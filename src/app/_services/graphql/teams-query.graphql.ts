import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Team } from './../../_models/team.model';

export interface TeamsOptionResult {
  result: Team[];
}

export interface TeamsOptionResponse {
  teams: TeamsOptionResult;
}

@Injectable({
  providedIn: 'root',
})
export class TeamsOptionGQL extends Query<TeamsOptionResponse> {
  document = gql`
    query AllTeams(
      $skip: Int = 0
      $take: Int = 100
      $name: String
      $ownerId: ID
    ) {
      teams(skip: $skip, take: $take, name: $name, ownerId: $ownerId) {
        result {
          id
          name
        }
      }
    }
  `;
}
