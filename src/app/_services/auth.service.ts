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
import { TokenStorageService } from './token-storage.service';

const GET_USER = gql`
  query GetUser {
    loggedUser {
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
  public user?: User;

  constructor(
    private readonly apollo: Apollo,
    private router: Router,
    private http: HttpClient,
    private storage: TokenStorageService
  ) {
    this.authSubject = new BehaviorSubject<Auth>(this.storage.getAuth());
    this.auth$ = this.authSubject.asObservable();
  }

  public get authValue(): Auth {
    return this.authSubject.value;
  }

  updateAuth(auth: Auth) {
    this.authSubject.next(auth);
    this.apollo
      .watchQuery<any>({
        query: GET_USER,
      })
      .valueChanges.pipe(first())
      .subscribe(({ data }) => {
        this.user = data.loggedUser;
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
    this.http.get<any>(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    this.stopRefreshTokenTimer();
    this.resetAuth();
  }

  resetAuth() {
    this.storage.removeAuth();
    this.authSubject.next(this.storage.getAuth());
    this.router.navigate(['/login']);
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
