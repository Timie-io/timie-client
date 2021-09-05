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
    window.sessionStorage.clear();
  }

  public saveAuth(authInfo: Auth): void {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.setItem(
      AUTH_TOKEN_KEY,
      authInfo.accessToken as string
    );
    window.sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      authInfo.refreshToken as string
    );
  }

  public getAuth(): Auth {
    const accessToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
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
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
