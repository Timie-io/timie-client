import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Task } from '../../../_models/task.model';
import { TaskResponse } from '../graphql/tasks-query.graphql';
import { TaskGQL } from './../graphql/tasks-query.graphql';
import { TaskModalComponent } from './../task-modal/task-modal.component';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent implements OnInit {
  private taskQuery: QueryRef<TaskResponse>;

  error = '';

  taskId: string | null = null;

  task?: Task;

  constructor(
    private readonly taskGQL: TaskGQL,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly modalService: NgbModal
  ) {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.taskQuery = this.taskGQL.watch(
      { id: this.taskId },
      { errorPolicy: 'ignore' }
    );
  }

  ngOnInit(): void {
    this.taskQuery.valueChanges.subscribe(({ data }) => {
      if (!data) {
        this.error = 'Task not found';
      }
      this.task = data?.task;
    });
  }

  backToPrevious() {
    window.history.back();
  }

  editTask() {
    const modal = this.modalService.open(TaskModalComponent);
    modal.componentInstance.id = this.task?.id;
    modal.componentInstance.title = this.task?.title;
    modal.componentInstance.description = this.task?.description;
    modal.componentInstance.priority = this.task?.priority;
    modal.componentInstance.projectId = this.task?.project?.id;
    modal.componentInstance.active = this.task?.active;
  }
}
