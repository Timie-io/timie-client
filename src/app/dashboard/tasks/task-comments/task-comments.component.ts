import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.css'],
})
export class TaskCommentsComponent implements OnInit {
  @Input() taskId: string | null = null;

  constructor() {}

  ngOnInit(): void {}
}
