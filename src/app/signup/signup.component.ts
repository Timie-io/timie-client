import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../_services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  form: FormGroup;

  submitted = false;
  loading = false;
  error = '';

  constructor(
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(128),
        ],
      ],
      password1: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required, this.passwordMatch()]],
    });
  }

  private passwordMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.form) {
        return null;
      }
      if (
        this.form.controls.password1.value !==
        this.form.controls.password2.value
      ) {
        return {
          passwordMatch: true,
        };
      }
      return null;
    };
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {}

  onSubmit() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    this.error = '';
    this.loading = true;
    const email = this.form.controls.email.value;
    const name = this.form.controls.name.value;
    const password = this.form.controls.password1.value;
    this.authService.signUp$(email, name, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error === 'Action not allowed') {
          this.error = 'This email is not authorized to sign up';
        } else {
          this.error = 'An unexpected error happened';
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
