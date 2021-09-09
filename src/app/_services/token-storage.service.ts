import { Injectable } from '@angular/core';
import { Auth } from '../_models/auth.model';

const AUTH_TOKEN_KEY = 'access-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor() {}

  signOut(): void {
    window.localStorage.clear();
  }

  public saveAuth(authInfo: Auth): void {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.setItem(AUTH_TOKEN_KEY, authInfo.accessToken as string);
    window.localStorage.setItem(
      REFRESH_TOKEN_KEY,
      authInfo.refreshToken as string
    );
  }

  public getAuth(): Auth {
    const accessToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken && refreshToken) {
      const active = true;
      return {
        accessToken,
        refreshToken,
        active,
      };
    }
    return { active: false };
  }

  public removeAuth() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
