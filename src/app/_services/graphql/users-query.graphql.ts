import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { User } from '../../_models/user.model';

export interface AllUsersResponse {
  users: User[];
}

export interface LoggedUserResponse {
  loggedUser: User;
}

@Injectable({
  providedIn: 'root',
})
export class AllUsersQueryGQL extends Query<AllUsersResponse> {
  document = gql`
    query GetAllUsers {
      users {
        id
        name
        email
        isAdmin
      }
    }
  `;
}

@Injectable({
  providedIn: 'root',
})
export class LoggedUserGQL extends Query<LoggedUserResponse> {
  document = gql`
    query GetLoggedUser {
      loggedUser {
        id
        email
        name
        isAdmin
      }
    }
  `;
}
