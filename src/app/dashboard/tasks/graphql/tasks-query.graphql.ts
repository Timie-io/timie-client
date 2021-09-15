import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Task } from './../../../_models/task.model';

export interface AllTasksResult {
  total: number;
  result: Task[];
}

export interface AllTasksResponse {
  tasks: AllTasksResult;
}

@Injectable({
  providedIn: 'root',
})
export class AllTasksGQL extends Query<AllTasksResponse> {
  document = gql`
    query GetAllTasks(
      $skip: Int = 0
      $take: Int = 25
      $title: String
      $projectId: ID
      $active: Boolean
    ) {
      tasks(
        skip: $skip
        take: $take
        title: $title
        projectId: $projectId
        active: $active
      ) {
        total
        result {
          id
          title
          description
          priority
          creationDate
          lastModified
          active
          project {
            id
            name
          }
          creator {
            name
          }
        }
      }
    }
  `;
}
