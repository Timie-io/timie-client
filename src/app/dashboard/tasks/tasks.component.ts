import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Task } from './../../_models/task.model';
import { TasksService } from './../../_services/tasks.service';
import { TaskModalComponent } from './task-modal/task-modal.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  constructor(
    private readonly tasksService: TasksService,
    private readonly modalService: NgbModal,
    private readonly router: Router
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.tasksService.search = value;
        this.tasksService.applyFilters();
      });
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

  get projects() {
    return this.tasksService.projects;
  }

  get projectSelected() {
    return this.tasksService.projectSelected;
  }

  set projectSelected(value: string) {
    this.tasksService.projectSelected = value;
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
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
      this.tasksService.removeTasks(task);
    }
  }
}
