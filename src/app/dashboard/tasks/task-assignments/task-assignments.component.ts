import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskAssignmentModalComponent } from './task-assignment-modal/task-assignment-modal.component';

@Component({
  selector: 'app-task-assignments',
  templateUrl: './task-assignments.component.html',
  styleUrls: ['./task-assignments.component.css'],
})
export class TaskAssignmentsComponent implements OnInit {
  @Input() taskId: string | null = null;

  constructor(private readonly modalService: NgbModal) {}

  ngOnInit(): void {}

  newAssignment() {
    const modal = this.modalService.open(TaskAssignmentModalComponent);
    modal.componentInstance.taskId = this.taskId;
  }
}
