import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { User } from '../../_models/user.model';

export interface UpdatePasswordInput {
  password: string;
}

export interface UpdateUserPasswordResponse {
  user: User;
}

export interface RemoveUserResponse {
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateUserPasswordGQL extends Mutation<UpdateUserPasswordResponse> {
  document = gql`
    mutation UpdatePassword($data: UpdatePasswordInput!) {
      updateUserPassword(data: $data) {
        id
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveUserGQL extends Mutation<RemoveUserResponse> {
  document = gql`
    mutation RemoveUser {
      removeUser {
        id
      }
    }
  `;
}
