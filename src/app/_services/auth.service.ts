import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Auth } from '../_models/auth.model';
import { User } from '../_models/user.model';
import { GraphQLModule } from './../_graphql/graphql.module';
import { TokenStorageService } from './token-storage.service';

const GET_USER = gql`
  query GetUser {
    loggedUser {
      id
      email
      name
      isAdmin
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private refreshTokenTimeout: number | undefined;
  private authSubject: BehaviorSubject<Auth>;
  public auth$: Observable<Auth>;
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor(
    private readonly apollo: Apollo,
    private router: Router,
    private http: HttpClient,
    private graphQLModule: GraphQLModule,
    private storage: TokenStorageService
  ) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();
    this.authSubject = new BehaviorSubject<Auth>(this.storage.getAuth());
    this.auth$ = this.authSubject.asObservable();
  }

  public get authValue(): Auth {
    return this.authSubject.value;
  }

  public get user(): User | null {
    return this.userSubject.value;
  }

  private restartSubscriptionsClient() {
    const client = this.graphQLModule.subscriptionClient;
    if (client) {
      client.close(true, true);
      (<any>client).connect();
    }
  }

  updateAuth(auth: Auth) {
    this.authSubject.next(auth);
    this.restartSubscriptionsClient();
    this.apollo
      .watchQuery<any>({
        query: GET_USER,
      })
      .valueChanges.pipe(first())
      .subscribe(({ data }) => {
        this.userSubject.next(data.loggedUser);
      });
  }

  login$(username: string, password: string): Observable<Auth> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/signin`, { username, password })
      .pipe(
        map((data) => {
          const auth = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            active: true,
          } as Auth;
          this.updateAuth(auth);
          this.storage.saveAuth(auth);
          this.startRefreshTokenTimer();
          return auth;
        })
      );
  }

  logout() {
    this.http.get<any>(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.startRefreshTokenTimer();
        this.resetAuth();
      },
    });
  }

  allowAccess$(email: string, expireSeconds: number) {
    return this.http.post<any>(`${environment.apiUrl}/auth/allow`, {
      email,
      expireSeconds,
    });
  }

  signUp$(email: string, name: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/signup`, {
        email,
        name,
        password,
      })
      .pipe(
        map((data) => {
          const auth = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            active: true,
          } as Auth;
          this.updateAuth(auth);
          this.storage.saveAuth(auth);
          this.startRefreshTokenTimer();
          return auth;
        })
      );
  }

  resetAuth() {
    this.storage.removeAuth();
    this.authSubject.next(this.storage.getAuth());
    this.userSubject.next(null);
    window.location.replace('/login'); // Force a total app reloading
  }

  refreshToken$(): Observable<Auth> {
    const auth = this.storage.getAuth();
    return this.http
      .post<any>(`${environment.apiUrl}/auth/refresh`, {
        headers: { Authorization: 'Bearer ' + auth.refreshToken },
      })
      .pipe(
        map((data) => {
          const auth = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            active: true,
          } as Auth;
          this.storage.saveAuth(auth);
          this.updateAuth(auth);
          this.startRefreshTokenTimer();
          return auth;
        })
      );
  }

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    if (!this.authValue.accessToken) {
      return;
    }
    const jwtToken = JSON.parse(atob(this.authValue.accessToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = window.setTimeout(
      () => this.refreshToken$()?.subscribe(),
      timeout
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
