import { Injectable } from '@angular/core';
import { gql, Query } from 'apollo-angular';
import { Comment } from '../../_models/comment.model';

export interface CommentsResult {
  total: number;
  result: Comment[];
}

export interface CommentsResponse {
  comments: CommentsResult;
}

@Injectable({
  providedIn: 'root',
})
export class CommentsGQL extends Query<CommentsResponse> {
  document = gql`
    query GetAllComments(
      $skip: Int = 0
      $take: Int = 25
      $taskId: ID
      $userId: ID
    ) {
      comments(skip: $skip, take: $take, taskId: $taskId, userId: $userId) {
        total
        result {
          id
          creationDate
          body
          user {
            id
            name
            email
          }
          task {
            id
            title
          }
        }
      }
    }
  `;
}
