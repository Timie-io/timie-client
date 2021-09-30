import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QueryRef } from 'apollo-angular';
import { Task } from '../_models/task.model';
import { AuthService } from './auth.service';
import { RemoveTaskGQL } from './graphql/tasks-mutation.graphql';
import { AllTasksGQL, AllTasksResponse } from './graphql/tasks-query.graphql';
import {
  TaskAddedGQL,
  TaskRemovedGQL,
  TaskSubscriptionInput,
} from './graphql/tasks-subscription.graphql';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private tasksQuery: QueryRef<AllTasksResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 50;
  total = 0;

  tasks: Task[] = [];
  projects: { [id: string]: string } = {};
  projectSelected = '';

  search = '';
  onlyActive = true;
  onlyFollowing = true;

  constructor(
    private readonly authService: AuthService,
    private readonly allTasksGQL: AllTasksGQL,
    private readonly removeTaskGQL: RemoveTaskGQL,
    private readonly taskAddedGQL: TaskAddedGQL,
    private readonly taskRemovedGQL: TaskRemovedGQL,
    private readonly router: Router
  ) {
    this.tasksQuery = this.allTasksGQL.watch();
    this.tasksQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.tasks.total;
      this.tasks = data.tasks.result;
      for (let task of this.tasks) {
        if (task.project) {
          this.projects[task.project.id] = task.project.name;
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
    filters['title'] = this.search || undefined;
    filters['projectId'] = this.projectSelected || undefined;
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
        const taskAdded = subscriptionData.data.taskAdded;
        const newList = prev.tasks.result.filter(
          (task) => task.id !== taskAdded.id
        );

        return {
          ...prev,
          tasks: {
            __typename: 'TasksResult',
            total: prev.tasks.total + 1,
            result: [taskAdded, ...newList],
          },
        };
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
        const taskRemoved = subscriptionData.data.taskRemoved;
        const newTaskList = prev.tasks.result.filter(
          (task) => task.id !== taskRemoved.id
        );

        return {
          ...prev,
          tasks: {
            __typename: 'TasksResult',
            total: prev.tasks.total - 1,
            result: newTaskList,
          },
        };
      },
    });
  }

  removeTasks(task: Task) {
    this.removeTaskGQL.mutate({ id: task.id }).subscribe({
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
