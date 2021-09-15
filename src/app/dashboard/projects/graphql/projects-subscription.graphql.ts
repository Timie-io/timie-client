import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';
import { Project } from './../../../_models/project.model';

export interface ProjectAddedResponse {
  projectAdded: Project;
}

export interface ProjectRemovedResponse {
  removeProject: Project;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectAddedGQL extends Subscription<ProjectAddedResponse> {
  document = gql`
    subscription ProjectAdded {
      projectAdded {
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectRemovedGQL extends Subscription<ProjectRemovedResponse> {
  document = gql`
    subscription ProjectRemoved {
      projectRemoved {
        id
      }
    }
  `;
}
