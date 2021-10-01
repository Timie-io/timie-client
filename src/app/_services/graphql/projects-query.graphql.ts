import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { ProjectView } from '../../_models/project-view.model';
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

export interface ProjectsViewResult {
  total: number;
  result: ProjectView[];
}

export interface ProjectsViewResponse {
  projectsView: ProjectsViewResult;
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
export class ProjectsViewGQL extends Query<ProjectsViewResponse> {
  document = gql`
    query ProjectsView(
      $skip: Int = 0
      $take: Int = 25
      $search: String
      $active: Boolean
      $ownerId: ID
      $teamId: ID
      $sortBy: [SortInput]
    ) {
      projectsView(
        skip: $skip
        take: $take
        search: $search
        active: $active
        ownerId: $ownerId
        teamId: $teamId
        sortBy: $sortBy
      ) {
        total
        result {
          id
          name
          description
          ownerId
          ownerName
          teamId
          teamName
          created
          active
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
      $take: Int = 50
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
