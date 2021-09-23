import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Assignment } from '../../_models/assignment.model';

export interface NewAssignmentInput {
  taskId: string;
  userId: string;
  note: string;
  deadline: string;
  statusCode: string;
}

export interface CreateAssignmentResponse {
  createAssignment: Assignment;
}

export interface UpdateAssignmentResponse {
  updateAssignment: Assignment;
}

export interface RemoveAssignmentResponse {
  removeAssignment: Assignment;
}

export interface NewAssignmentInput {
  taskId: string;
  note: string;
  deadline: string;
  userId: string;
  statusCode: string;
}

export interface UpdateAssignmentInput {
  note: string;
  deadline: string;
  userId: string;
  statusCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreateAssignmentGQL extends Mutation<CreateAssignmentResponse> {
  document = gql`
    mutation CreateAssignment($data: NewAssignmentInput!) {
      createAssignment(data: $data) {
        id
        creator {
          id
          name
        }
        creationDate
        user {
          id
          name
          email
        }
        deadline
        note
        status {
          code
          label
          order
        }
        totalTime
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateAssignmentGQL extends Mutation<UpdateAssignmentResponse> {
  document = gql`
    mutation UpdateAssignment($id: ID!, $data: UpdateAssignmentInput!) {
      updateAssignment(id: $id, data: $data) {
        id
        note
        deadline
        status {
          code
          label
          order
        }
        totalTime
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveAssignmentGQL extends Mutation<RemoveAssignmentResponse> {
  document = gql`
    mutation RemoveAssignment($id: ID!) {
      removeAssignment(id: $id) {
        id
      }
    }
  `;
}
