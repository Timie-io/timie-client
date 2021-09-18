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

export interface RemoveAssignmentResponse {
  removeAssignment: Assignment;
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
        status
      }
    }
  `;
}

export class RemoveAssignmentGQL extends Mutation<RemoveAssignmentResponse> {
  document = gql`
    mutation RemoveAssignment($id: ID!) {
      removeAssignment(id: $id) {
        id
      }
    }
  `;
}
