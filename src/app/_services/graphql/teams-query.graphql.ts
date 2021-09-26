import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { User } from '../../_models/user.model';
import { Team } from './../../_models/team.model';

export interface TeamsOptionResult {
  result: Team[];
}

export interface TeamsOptionResponse {
  teams: TeamsOptionResult;
}

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

export interface TeamMembersResult {
  id: string;
  members: User[];
}

export interface TeamMembersResponse {
  team: TeamMembersResult;
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
            id
            email
            name
          }
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class TeamMembersGQL extends Query<TeamMembersResponse> {
  document = gql`
    query GetTeamMembers($id: ID!) {
      team(id: $id) {
        id
        members {
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
export class TeamsOptionGQL extends Query<TeamsOptionResponse> {
  document = gql`
    query AllTeams(
      $skip: Int = 0
      $take: Int = 50
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
