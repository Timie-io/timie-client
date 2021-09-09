import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { User } from '../_models/user.model';
import { AuthService } from './../_services/auth.service';

const GET_USER = gql`
  query GetUser {
    loggedUser {
      email
      name
      isAdmin
    }
  }
`;

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit, OnDestroy {
  public isMenuCollapsed = true;
  public user?: User;
  public loading = false;

  private querySubscription?: Subscription;

  constructor(
    private readonly apollo: Apollo,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: GET_USER,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.loading = loading;
        this.user = data.loggedUser;
      });
  }

  ngOnDestroy() {
    this.querySubscription?.unsubscribe();
  }

  userLogout() {
    this.authService.logout();
  }
}
