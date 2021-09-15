import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';

export interface TaskAddedResponse {
  taskAdded: Task;
}

export interface TaskRemovedResponse {
  taskRemoved: Task;
}

@Injectable({
  providedIn: 'root',
})
export class TaskAddedGQL extends Subscription<TaskAddedResponse> {
  document = gql`
    subscription TaskAdded {
      taskAdded {
        id
        title
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
    subscription TaskRemoved {
      taskRemoved {
        id
      }
    }
  `;
}
