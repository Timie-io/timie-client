import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Team } from '../../../_models/team.model';

export interface UpdateTeamResponse {
  updateTeam: Team;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export interface CreateTeamResponse {
  createTeam: Team;
}

export interface NewTeamInput {
  name: string;
  description: string;
}

export interface RemoveTeamResponse {
  removeTeam: Team;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateTeamGQL extends Mutation<UpdateTeamResponse> {
  document = gql`
    mutation UpdateTeam($id: ID!, $data: UpdateTeamInput!) {
      updateTeam(id: $id, data: $data) {
        id
        name
        description
        owner {
          name
          email
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class CreateTeamGQL extends Mutation<CreateTeamResponse> {
  document = gql`
    mutation CreateTeam($data: NewTeamInput!) {
      createTeam(data: $data) {
        id
        name
        description
        owner {
          name
          email
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveTeamGQL extends Mutation<RemoveTeamResponse> {
  document = gql`
    mutation RemoveTeam($id: ID!) {
      removeTeam(id: $id) {
        id
      }
    }
  `;
}
