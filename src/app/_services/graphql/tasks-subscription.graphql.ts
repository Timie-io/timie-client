import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';
import { Task } from '../../_models/task.model';

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
export class TaskRemovedGQL extends Subscription<TaskRemovedResponse> {
  document = gql`
    subscription TaskRemoved($input: TaskAddedInput) {
      taskRemoved(input: $input) {
        id
      }
    }
  `;
}
