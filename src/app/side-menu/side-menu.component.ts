import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './../_services/auth.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css'],
})
export class SideMenuComponent implements OnInit, OnDestroy {
  private currentUserSub?: Subscription;
  currentUser: User | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  ngOnDestroy() {
    this.currentUserSub?.unsubscribe();
  }
}
