import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Project } from './../../../_models/project.model';

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface NewProjectInput {
  name: string;
  description: string;
}

export interface CreateProjectResponse {
  createProject: Project;
}

export interface UpdateProjectResponse {
  updateProject: Project;
}

export interface RemoveProjectResponse {
  removeProject: Project;
}

@Injectable({
  providedIn: 'root',
})
export class CreateProjectGQL extends Mutation<CreateProjectResponse> {
  document = gql`
    mutation CreateProject($teamId: ID, $data: NewProjectInput!) {
      createProject(teamId: $teamId, data: $data) {
        id
        name
        description
        creationDate
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateProjectGQL extends Mutation<UpdateProjectResponse> {
  document = gql`
    mutation UpdateProject($id: ID!, $data: UpdateProjectInput!) {
      updateProject(id: $id, data: $data) {
        id
        name
        description
        creationDate
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveProjectGQL extends Mutation<UpdateProjectResponse> {
  document = gql`
    mutation RemoveProject($id: ID!) {
      removeProject(id: $id) {
        id
      }
    }
  `;
}
