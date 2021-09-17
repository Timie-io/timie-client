import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Task } from './../../../_models/task.model';
import { User } from './../../../_models/user.model';

export interface AllTasksResult {
  total: number;
  result: Task[];
}

export interface AllTasksResponse {
  tasks: AllTasksResult;
}

export interface TaskResponse {
  task: Task;
}

export interface TaskFollowers {
  followers: User[];
}

export interface TaskFollowersResponse {
  task: TaskFollowers;
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

@Injectable({
  providedIn: 'root',
})
export class TaskGQL extends Query<TaskResponse> {
  document = gql`
    query GetTask($id: ID!) {
      task(id: $id) {
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
        assignments {
          id
          creator {
            name
          }
          creationDate
          user {
            name
          }
          note
          deadline
          status {
            code
            label
          }
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class TaskFollowersGQL extends Query<TaskFollowersResponse> {
  document = gql`
    query GetTaskFollowers($id: ID!) {
      task(id: $id) {
        followers {
          id
          name
          email
        }
      }
    }
  `;
}
