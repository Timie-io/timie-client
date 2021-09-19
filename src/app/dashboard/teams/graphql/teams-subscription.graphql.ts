import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';
import { Team } from '../../../_models/team.model';

export interface TeamAddedResponse {
  teamAdded: Team;
}

export interface TeamRemovedResponse {
  teamRemoved: Team;
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
          id
          email
          name
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class TeamRemovedGQL extends Subscription<TeamRemovedResponse> {
  document = gql`
    subscription TeamRemoved {
      teamRemoved {
        id
      }
    }
  `;
}
