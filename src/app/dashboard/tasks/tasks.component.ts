import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Project } from '../../_models/project.model';
import {
  ProjectOptionsResponse,
  ProjectsOptionGQL,
} from './../../_services/graphql/projects-query.graphql';
import { SortService, SortUpdate } from './../../_services/sort.service';
import { TasksService } from './../../_services/tasks.service';
import { TaskModalComponent } from './task-modal/task-modal.component';

interface EditTaskInput {
  id: string;
  title: string;
  description: string;
  priority: number;
  projectId: string;
  active: boolean;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  projects: Project[] = [];
  private projectsOptionQuery: QueryRef<ProjectOptionsResponse>;

  private sortedColumnsSub: Subscription;
  sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};

  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsOptionGQL: ProjectsOptionGQL,
    private readonly sortService: SortService,
    private readonly modalService: NgbModal,
    private readonly router: Router
  ) {
    this.projectsOptionQuery = this.projectsOptionGQL.watch({ active: true });
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.tasksService.search = value;
        this.tasksService.applyFilters();
      });
    this.sortedColumnsSub = this.sortService.sortUpdate$.subscribe(
      (sortUpdate: SortUpdate) => {
        if (sortUpdate[0] === 'tasks') {
          this.sortedColumns[sortUpdate[1]] = sortUpdate[2];
        }
      }
    );
  }

  get error() {
    return this.tasksService.error;
  }

  set error(value: string) {
    this.tasksService.error = value;
  }

  get tasks() {
    return this.tasksService.tasks;
  }

  get page() {
    return this.tasksService.page;
  }

  set page(value: number) {
    this.tasksService.page = value;
  }

  get pageSize() {
    return this.tasksService.pageSize;
  }

  get total() {
    return this.tasksService.total;
  }

  get search() {
    return this.tasksService.search;
  }

  set search(value: string) {
    this.tasksService.search = value;
  }

  get onlyActive() {
    return this.tasksService.onlyActive;
  }

  set onlyActive(value: boolean) {
    this.tasksService.onlyActive = value;
  }

  get onlyFollowing() {
    return this.tasksService.onlyFollowing;
  }

  set onlyFollowing(value: boolean) {
    this.tasksService.onlyFollowing = value;
  }

  get projectSelected() {
    return this.tasksService.projectSelected;
  }

  set projectSelected(value: string) {
    this.tasksService.projectSelected = value;
  }

  ngOnInit(): void {
    this.tasksService.applyFilters();
    this.projectsOptionQuery.refetch().then(({ data }) => {
      this.projects = data.projects.result;
    });
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.sortedColumnsSub.unsubscribe();
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onProjectsChange() {
    this.tasksService.applyFilters();
  }

  onPageChange() {
    this.tasksService.applyFilters();
  }

  onActiveChange() {
    this.onlyActive = !this.onlyActive;
    this.tasksService.applyFilters();
  }

  onFollowingChange() {
    this.onlyFollowing = !this.onlyFollowing;
    this.tasksService.applyFilters();
  }

  viewTask(taskId: string) {
    this.router.navigate(['/tasks', taskId]);
  }

  newTask() {
    this.modalService.open(TaskModalComponent);
  }

  editTask(input: EditTaskInput) {
    const modal = this.modalService.open(TaskModalComponent);
    modal.componentInstance.id = input.id;
    modal.componentInstance.title = input.title;
    modal.componentInstance.description = input.description;
    modal.componentInstance.priority = input.priority;
    modal.componentInstance.projectId = input.projectId;
    modal.componentInstance.active = input.active;
  }

  removeTask(taskId: string) {
    if (confirm('Are you sure about removing this task?')) {
      this.tasksService.removeTasks(taskId);
    }
  }

  toggleSort(column: string) {
    this.sortService.toogleColumn('tasks', column);
    this.tasksService.applyFilters();
  }
}
