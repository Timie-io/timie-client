import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';

export interface TaskAddedResponse {
  taskAdded: Task;
}

export interface TaskRemovedResponse {
  taskRemoved: Task;
}

export interface TaskSubscriptionInput {
  title?: string;
  active?: boolean;
  projectId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskAddedGQL extends Subscription<TaskAddedResponse> {
  document = gql`
    subscription TaskAdded($input: TaskAddedInput) {
      taskAdded(input: $input) {
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class TaskRemovedGQL extends Subscription<TaskRemovedResponse> {
  document = gql`
    subscription TaskRemoved($input: TaskAddedInput!) {
      taskRemoved(input: $input) {
        id
      }
    }
  `;
}
