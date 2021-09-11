import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  currentYear?: number;
  loginForm: FormGroup;
  loading = false;
  submited = false;
  returnUrl = '/';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.authValue.active) {
      this.router.navigate(['/']);
    }
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.email],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();

    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submited = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService
      .login$(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        },
      });
  }
}
