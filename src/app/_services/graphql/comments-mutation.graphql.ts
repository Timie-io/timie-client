import { Injectable } from '@angular/core';
import { gql, Mutation } from 'apollo-angular';
import { Comment } from '../../_models/comment.model';

export interface NewCommentInput {
  body: string;
}

export interface UpdateCommentInput {
  body?: string;
}

export interface CreateCommentResponse {
  createComment: Comment;
}

export interface UpdateCommentResponse {
  updateComment: Comment;
}

export interface RemoveCommentResponse {
  removeComment: Comment;
}

@Injectable({
  providedIn: 'root',
})
export class CreateCommentGQL extends Mutation<CreateCommentResponse> {
  document = gql`
    mutation CreateComment($taskId: ID!, $data: NewCommentInput!) {
      createComment(taskId: $taskId, data: $data) {
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateCommentGQL extends Mutation<UpdateCommentResponse> {
  document = gql`
    mutation UpdateComment($id: ID!, $data: UpdateCommentInput!) {
      updateComment(id: $id, data: $data) {
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
  `;
}

@Injectable({
  providedIn: 'root',
})
export class RemoveCommentGQL extends Mutation<RemoveCommentResponse> {
  document = gql`
    mutation RemoveComment($id: ID!) {
      removeComment(id: $id) {
        id
      }
    }
  `;
}
