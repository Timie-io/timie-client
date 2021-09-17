import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-assignments',
  templateUrl: './task-assignments.component.html',
  styleUrls: ['./task-assignments.component.css'],
})
export class TaskAssignmentsComponent implements OnInit {
  @Input() taskId: string | null = null;

  constructor() {}

  ngOnInit(): void {}
}
