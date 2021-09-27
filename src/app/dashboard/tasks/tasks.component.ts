import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RemoveTaskGQL } from '../../_services/graphql/tasks-mutation.graphql';
import {
  AllTasksGQL,
  AllTasksResponse,
} from '../../_services/graphql/tasks-query.graphql';
import {
  TaskAddedGQL,
  TaskRemovedGQL,
  TaskSubscriptionInput,
} from '../../_services/graphql/tasks-subscription.graphql';
import { Task } from './../../_models/task.model';
import { AuthService } from './../../_services/auth.service';
import { TaskModalComponent } from './task-modal/task-modal.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit, OnDestroy {
  private tasksQuery: QueryRef<AllTasksResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};
  private currentUserSubscription: Subscription;

  error = '';

  search = '';
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  page = 1;
  pageSize = 50;
  total = 0;

  tasks: Task[] = [];
  projects: { [id: string]: string } = {};
  projectSelected = '';

  onlyActive = true;
  onlyFollowing = true;

  constructor(
    private readonly authService: AuthService,
    private readonly allTasksGQL: AllTasksGQL,
    private readonly modalService: NgbModal,
    private readonly removeTaskGQL: RemoveTaskGQL,
    private readonly taskAddedGQL: TaskAddedGQL,
    private readonly taskRemovedGQL: TaskRemovedGQL,
    private readonly router: Router
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.applyFilters();
      });
    this.tasksQuery = this.allTasksGQL.watch();
    this.currentUserSubscription = this.authService.user$.subscribe((value) => {
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

  ngOnInit(): void {
    this.applyFilters();
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

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.searchSub.unsubscribe();
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

  onSearchChange(value: string) {
    this.searchChanged.next(value);
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

  onFollowingChange() {
    this.onlyFollowing = !this.onlyFollowing;
    this.applyFilters();
  }

  viewTask(task: Task) {
    this.router.navigate(['/tasks', task.id]);
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
            this.error = 'This task contains assignments';
          } else {
            this.error = error;
          }
        },
      });
    }
  }
}
