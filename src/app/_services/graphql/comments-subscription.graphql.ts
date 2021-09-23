import { Injectable } from '@angular/core';
import { gql, Subscription } from 'apollo-angular';

export interface CommentAddedResponse {
  commentAdded: Comment;
}

export interface CommentRemovedResponse {
  commentRemoved: Comment;
}

@Injectable({
  providedIn: 'root',
})
export class CommentAddedGQL extends Subscription<CommentAddedResponse> {
  document = gql`
    subscription CommentAdded($input: CommentAddedInput!) {
      commentAdded(input: $input) {
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
export class CommentRemovedGQL extends Subscription<CommentRemovedResponse> {
  document = gql`
    subscription CommentRemoved($input: CommentAddedInput!) {
      commentRemoved(input: $input) {
        id
      }
    }
  `;
}
