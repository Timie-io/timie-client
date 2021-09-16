import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Task } from './../../_models/task.model';
import { RemoveTaskGQL } from './graphql/tasks-mutation.graphql';
import { AllTasksGQL, AllTasksResponse } from './graphql/tasks-query.graphql';
import {
  TaskAddedGQL,
  TaskRemovedGQL,
  TaskSubscriptionInput,
} from './graphql/tasks-subscription.graphql';
import { TaskModalComponent } from './task-modal/task-modal.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit {
  private tasksQuery: QueryRef<AllTasksResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';
  search = '';

  page = 1;
  pageSize = 50;
  total = 0;

  tasks: Task[] = [];
  projects: { [id: string]: string } = {};
  projectSelected = '';

  onlyActive = true;

  constructor(
    private readonly allTasksGQL: AllTasksGQL,
    private readonly modalService: NgbModal,
    private readonly removeTaskGQL: RemoveTaskGQL,
    private readonly taskAddedGQL: TaskAddedGQL,
    private readonly taskRemovedGQL: TaskRemovedGQL
  ) {
    this.tasksQuery = allTasksGQL.watch(this.filters);
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    if (this.onlyActive) {
      filters['active'] = true;
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

  ngOnInit(): void {
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
  }

  private applyFilters() {
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

        return {
          ...prev,
          tasks: {
            __typename: 'TasksResult',
            total: prev.tasks.total + 1,
            result: [taskAdded, ...prev.tasks.result],
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

  onSearchChange() {
    if (this.search.length > 3 || !this.search) {
      this.applyFilters();
    }
  }

  onProjectsChange() {
    this.applyFilters();
  }

  onPageChange() {
    this.applyFilters();
  }

  onActiveChange() {
    this.onlyActive = !this.onlyActive;
    this.applyFilters();
  }

  newTask() {
    this.modalService.open(TaskModalComponent);
  }

  editTask(task: Task) {
    const modal = this.modalService.open(TaskModalComponent);
    modal.componentInstance.id = task.id;
    modal.componentInstance.title = task.title;
    modal.componentInstance.description = task.description;
    modal.componentInstance.priority = task.priority;
    modal.componentInstance.projectId = task.project?.id;
    modal.componentInstance.active = task.active;
  }

  removeTask(task: Task) {
    if (confirm('Are you sure about removing this task?')) {
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
            this.error = 'This task has assignments';
          } else {
            this.error = error;
          }
        },
      });
    }
  }
}
