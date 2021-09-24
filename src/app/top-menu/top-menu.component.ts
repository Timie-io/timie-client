import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './../_services/auth.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  loading = true;

  currentUser: User | null = null;
  private currentUserSub?: Subscription;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.currentUserSub?.unsubscribe();
  }

  userLogout() {
    this.authService.logout();
  }
}
