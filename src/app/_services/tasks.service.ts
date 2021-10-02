import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TaskView } from '../_models/task-view.model';
import { AuthService } from './auth.service';
import { RemoveTaskGQL } from './graphql/tasks-mutation.graphql';
import { TasksViewGQL, TasksViewResponse } from './graphql/tasks-query.graphql';
import {
  TaskAddedGQL,
  TaskRemovedGQL,
  TaskSubscriptionInput,
} from './graphql/tasks-subscription.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private tasksQuery: QueryRef<TasksViewResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  tasks: TaskView[] = [];
  projects: { [id: string]: string } = {};
  projectSelected = '';

  search = '';
  onlyActive = true;
  onlyFollowing = true;

  constructor(
    private readonly authService: AuthService,
    private readonly tasksViewGQL: TasksViewGQL,
    private readonly removeTaskGQL: RemoveTaskGQL,
    private readonly taskAddedGQL: TaskAddedGQL,
    private readonly taskRemovedGQL: TaskRemovedGQL,
    private readonly sortService: SortService
  ) {
    this.tasksQuery = this.tasksViewGQL.watch(this.filters);
    this.tasksQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.tasksView.total;
      this.tasks = data.tasksView.result;
      for (let task of this.tasks) {
        if (task.projectId) {
          this.projects[task.projectId] = task.projectName;
        }
      }
    });
    this.unsubscribeAdded = this.subscribeToTaskAdded(this.subscriptionInput);
    this.unsubscribeRemoved = this.subscribeToTaskRemoved(
      this.subscriptionInput
    );
    this.authService.user$.subscribe((value) => {
      if (value && this.onlyFollowing) {
        this.applyFilters();
      }
    });
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    if (this.onlyActive) {
      filters['active'] = true;
    }
    if (this.onlyFollowing && this.authService.user) {
      const userId = this.authService.user.id;
      filters['followerIds'] = [userId];
    }
    filters['search'] = this.search || undefined;
    filters['projectId'] = this.projectSelected || undefined;
    const sortOptions = this.sortService.getSortOptions('tasks');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
    return filters;
  }

  private get subscriptionInput(): TaskSubscriptionInput {
    const input = {
      title: this.search || undefined,
      active: this.onlyActive || undefined,
      projectId: this.projectSelected || undefined,
    };
    return input;
  }

  applyFilters() {
    this.tasksQuery.setVariables(this.filters);
    this.tasksQuery.refetch();
    this.unsubscribeAdded = this.subscribeToTaskAdded(this.subscriptionInput);
    this.unsubscribeRemoved = this.subscribeToTaskRemoved(
      this.subscriptionInput
    );
  }

  private subscribeToTaskAdded(input?: TaskSubscriptionInput) {
    this.unsubscribeAdded();
    return this.tasksQuery.subscribeToMore({
      document: this.taskAddedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        this.tasksQuery.refetch();
        return prev;
      },
    });
  }

  private subscribeToTaskRemoved(input?: TaskSubscriptionInput) {
    this.unsubscribeRemoved();
    return this.tasksQuery.subscribeToMore({
      document: this.taskRemovedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        this.tasksQuery.refetch();
        return prev;
      },
    });
  }

  removeTasks(taskId: string) {
    this.removeTaskGQL.mutate({ id: taskId }).subscribe({
      next: () => {
        this.error = '';
      },
      error: (error) => {
        if (
          error.message.includes(
            'violates foreign key constraint',
            'on table "assignment"'
          )
        ) {
          this.error = 'This task contains assignments';
        } else {
          this.error = error;
        }
      },
    });
  }
}
