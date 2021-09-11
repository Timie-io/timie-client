import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';
import { Team } from '../../../_models/team.model';

export interface TeamAddedResponse {
  teamAdded: Team;
}

@Injectable({
  providedIn: 'root',
})
export class TeamAddedGQL extends Subscription<TeamAddedResponse> {
  document = gql`
    subscription teamAdded {
      teamAdded {
        id
        name
        description
        owner {
          email
          name
        }
      }
    }
  `;
}
