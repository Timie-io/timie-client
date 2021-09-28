import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { Comment } from '../../../_models/comment.model';
import { AuthService } from './../../../_services/auth.service';
import {
  CreateCommentGQL,
  NewCommentInput,
  RemoveCommentGQL,
} from './../../../_services/graphql/comments-mutation.graphql';
import {
  CommentsGQL,
  CommentsResponse,
} from './../../../_services/graphql/comments-query.graphql';
import {
  CommentAddedGQL,
  CommentRemovedGQL,
} from './../../../_services/graphql/comments-subscription.graphql';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.css'],
})
export class TaskCommentsComponent implements OnInit, OnDestroy {
  @Input() taskId: string | null = null;

  error = '';

  take = 10;
  total = 0;
  comments: Comment[] = [];
  commentsQuery: QueryRef<CommentsResponse>;

  commentText = new FormControl('', Validators.required);
  submitted = false;

  currentUserId?: string;
  private currentUserSub?: Subscription;

  private unsubscribeToAdded = () => {};
  private unsubscribeToRemoved = () => {};

  constructor(
    private readonly authService: AuthService,
    private readonly commentsGQL: CommentsGQL,
    private readonly createCommentGQL: CreateCommentGQL,
    private readonly removeCommentGQL: RemoveCommentGQL,
    private readonly commentAddedGQL: CommentAddedGQL,
    private readonly commentRemovedGQL: CommentRemovedGQL
  ) {
    this.commentsQuery = this.commentsGQL.watch();
  }

  ngOnInit(): void {
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.id;
      }
    });
    this.commentsQuery.setVariables({
      take: this.take,
      taskId: this.taskId,
    });
    this.commentsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.comments.total;
      this.comments = data.comments.result;
    });
    this.unsubscribeToAdded = this.commentsQuery.subscribeToMore({
      document: this.commentAddedGQL.document,
      variables: {
        input: { taskId: this.taskId },
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        const commentAdded = subscriptionData.data.commentAdded;
        const oldList = prev.comments.result.filter(
          (comment) => comment.id !== commentAdded.id
        );

        return {
          ...prev,
          comments: {
            __typename: 'CommentsResult',
            total: prev.comments.total + 1,
            result: [commentAdded, ...oldList],
          },
        };
      },
    });
    this.unsubscribeToRemoved = this.commentsQuery.subscribeToMore({
      document: this.commentRemovedGQL.document,
      variables: {
        input: { taskId: this.taskId },
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        const commentRemoved = subscriptionData.data.commentRemoved;
        const newList = prev.comments.result.filter(
          (comment) => comment.id !== commentRemoved.id
        );

        return {
          ...prev,
          comments: {
            __typename: 'CommentsResult',
            total: prev.comments.total - 1,
            result: newList,
          },
        };
      },
    });
  }

  ngOnDestroy() {
    this.currentUserSub?.unsubscribe();
    this.unsubscribeToAdded();
    this.unsubscribeToRemoved();
  }

  get isThereMore() {
    return this.comments.length < this.total;
  }

  private get newCommentInput(): NewCommentInput {
    return {
      body: this.commentText.value,
    };
  }

  addNewComment() {
    this.submitted = true;
    if (this.commentText.errors) {
      return;
    }
    this.createCommentGQL
      .mutate({
        taskId: this.taskId,
        data: this.newCommentInput,
      })
      .subscribe({
        next: () => {
          this.commentText.setValue('');
          this.submitted = false;
        },
        error: (error) => {
          this.error = error;
        },
      });
  }

  removeComment(comment: Comment) {
    if (confirm('Are you sure about removing this comment?')) {
      this.removeCommentGQL.mutate({ id: comment.id }).subscribe({
        error: (error) => {
          this.error = error;
        },
      });
    }
  }

  loadMore() {
    this.take += this.take;
    this.commentsQuery.setVariables({
      take: this.take,
      taskId: this.taskId,
    });
  }
}
