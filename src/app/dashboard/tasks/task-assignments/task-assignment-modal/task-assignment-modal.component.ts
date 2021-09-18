import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-task-assignment-modal',
  templateUrl: './task-assignment-modal.component.html',
  styleUrls: ['./task-assignment-modal.component.css'],
})
export class TaskAssignmentModalComponent implements OnInit {
  @Input() id?: string;
  @Input() taskId?: string;
  @Input() userId?: string;
  @Input() note?: string;
  @Input() deadline?: string;
  @Input() statusCode?: string;

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(public modal: NgbActiveModal, formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      taskId: ['', Validators.required],
      userId: ['', Validators.required],
      note: [''],
      deadline: [''],
      statusCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.taskId) {
      this.error = 'No task specified';
    }
    this.form.controls.taskId.setValue(this.taskId);
    this.form.controls.userId.setValue(this.userId);
    this.form.controls.note.setValue(this.note);
    this.form.controls.deadline.setValue(this.deadline);
    this.form.controls.statusCode.setValue(this.statusCode);
  }
}
