import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Project } from './../../_models/project.model';

export interface ProjectsOptionResult {
  result: Project[];
}

export interface ProjectOptionsResponse {
  projects: ProjectsOptionResult;
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
