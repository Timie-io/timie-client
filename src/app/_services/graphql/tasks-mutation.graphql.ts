import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Task } from '../../_models/task.model';

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: number;
  active: boolean;
  projectId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: number;
  active?: boolean;
}

export interface CreateTaskResponse {
  createTask: Task;
}

export interface UpdateTaskResponse {
  updateTask: Task;
}

export interface RemoveTaskResponse {
  removeTask: Task;
}

export interface AddTaskFollowerResponse {
  addTaskFollower: Task;
}

export interface RemoveTaskFollowerResponse {
  removeTaskFollower: Task;
}

@Injectable({
  providedIn: 'root',
})
export class CreateTaskGQL extends Mutation<CreateTaskResponse> {
  document = gql`
    mutation CreateTask($data: NewTaskInput!) {
      createTask(data: $data) {
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
export class UpdateTaskGQL extends Mutation<UpdateTaskResponse> {
  document = gql`
    mutation UpdateTask($id: ID!, $data: UpdateTaskInput!) {
      updateTask(id: $id, data: $data) {
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
export class RemoveTaskGQL extends Mutation<RemoveTaskResponse> {
  document = gql`
    mutation RemoveTask($id: ID!) {
      removeTask(id: $id) {
        id
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class AddTaskFollowerGQL extends Mutation<AddTaskFollowerResponse> {
  document = gql`
    mutation AddTaskFollower($id: ID!, $userId: ID!) {
      addTaskFollower(id: $id, userId: $userId) {
        id
        followers {
          id
          name
          email
        }
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveTaskFollowerGQL extends Mutation<RemoveTaskFollowerResponse> {
  document = gql`
    mutation RemoveTaskFollower($id: ID!, $userId: ID!) {
      removeTaskFollower(id: $id, userId: $userId) {
        id
        followers {
          id
          name
          email
        }
      }
    }
  `;
}
