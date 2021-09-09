import { Component, OnInit } from '@angular/core';
import { AuthService } from './../_services/auth.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit {
  public isMenuCollapsed = true;
  public loading = true;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {}

  public get user() {
    return this.authService.user;
  }

  userLogout() {
    this.authService.logout();
  }
}
