import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-team-modal',
  templateUrl: './team-modal.component.html',
  styleUrls: ['./team-modal.component.css'],
})
export class TeamModalComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  @Input() name?: string;
  @Input() description?: string;

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(public modal: NgbActiveModal, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.form.controls.name.setValue(this.name);
    this.form.controls.description.setValue(this.description);
  }

  ngOnDestroy() {}

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.status != 'INVALID') {
      this.modal.close('Team saved');
    }
  }
}
