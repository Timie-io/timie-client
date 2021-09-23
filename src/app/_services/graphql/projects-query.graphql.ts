import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Project } from './../../_models/project.model';

export interface ProjectsOptionResult {
  result: Project[];
}

export interface ProjectOptionsResponse {
  projects: ProjectsOptionResult;
}

export interface AllProjectsResult {
  total: number;
  result: Project[];
}

export interface AllProjectsResponse {
  projects: AllProjectsResult;
}

@Injectable({
  providedIn: 'root',
})
export class AllProjectsGQL extends Query<AllProjectsResponse> {
  document = gql`
    query GetAllProjects(
      $skip: Int = 0
      $take: Int = 25
      $name: String
      $active: Boolean
      $ownerId: ID
      $teamId: ID
    ) {
      projects(
        skip: $skip
        take: $take
        name: $name
        active: $active
        ownerId: $ownerId
        teamId: $teamId
      ) {
        total
        result {
          id
          name
          description
          creationDate
          active
          owner {
            id
            name
            email
          }
          team {
            id
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
export class ProjectsOptionGQL extends Query<ProjectOptionsResponse> {
  document = gql`
    query GetProjectsOption(
      $skip: Int = 0
      $take: Int = 100
      $name: String
      $ownerId: ID
      $teamId: ID
    ) {
      projects(
        skip: $skip
        take: $take
        name: $name
        ownerId: $ownerId
        teamId: $teamId
      ) {
        result {
          id
          name
        }
      }
    }
  `;
}
