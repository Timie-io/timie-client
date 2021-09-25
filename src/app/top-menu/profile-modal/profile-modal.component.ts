import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { User } from '../../_models/user.model';
import { AuthService } from './../../_services/auth.service';
import {
  RemoveUserGQL,
  UpdateUserPasswordGQL,
} from './../../_services/graphql/users-mutation.graphql';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css'],
})
export class ProfileModalComponent implements OnInit, OnDestroy {
  user?: User;

  private currentUserSub?: Subscription;

  newPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  passwordSubmitted = false;
  loading = false;
  error = '';
  message = '';

  constructor(
    public modal: NgbActiveModal,
    private readonly authService: AuthService,
    private readonly updatePasswordGQL: UpdateUserPasswordGQL,
    private readonly removeUserGQL: RemoveUserGQL
  ) {}

  ngOnInit(): void {
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  ngOnDestroy() {
    this.currentUserSub?.unsubscribe();
  }

  onPasswordUpdate() {
    this.message = '';
    this.error = '';
    this.passwordSubmitted = true;
    if (this.newPassword.errors) {
      return;
    }
    this.loading = true;
    this.updatePasswordGQL
      .mutate({
        data: { password: this.newPassword.value },
      })
      .subscribe({
        next: () => {
          this.message = 'Password updated';
        },
        error: (error) => {
          if (error) {
            this.error = 'An unexpected error happened';
          }
        },
        complete: () => {
          this.passwordSubmitted = false;
          this.loading = false;
          this.newPassword.setValue('');
        },
      });
  }

  onUserDelete() {
    if (confirm('Are you sure about removing your user?')) {
      this.removeUserGQL.mutate().subscribe({
        next: () => {
          this.authService.logout();
        },
        error: (error) => {
          if (error.message.includes('violates foreign key constraint')) {
            this.error =
              'unable to remove the user because this user is active';
          } else {
            this.error = 'Unexpected error';
          }
        },
        complete: () => {
          this.modal.close();
        },
      });
    }
  }
}
