import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../../_services/auth.service';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.css'],
})
export class AccessComponent implements OnInit {
  error = '';
  message = '';

  form: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    formbuilder: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.form = formbuilder.group({
      email: ['', [Validators.required, Validators.email]],
      ttl: [60, [Validators.required, Validators.min(5), Validators.max(1440)]],
    });
  }

  ngOnInit(): void {}

  get f() {
    return this.form.controls;
  }

  private get requestData() {
    return {
      email: this.form.controls.email.value,
      expireSeconds: this.form.controls.ttl.value * 60,
    };
  }

  onSubmit() {
    this.error = '';
    this.message = '';
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    this.loading = true;
    const params = this.requestData;
    this.authService
      .allowAccess$(params.email, params.expireSeconds)
      .subscribe({
        next: () => {
          this.message = `Email ${params.email} is authorized to register`;
        },
        error: (error) => {
          if (error === 'Created') {
            this.message = `Email ${params.email} is authorized to register`;
          } else {
            this.error = 'An unexpected error happened';
          }
        },
        complete: () => {
          this.submitted = false;
          this.loading = false;
        },
      });
  }
}
