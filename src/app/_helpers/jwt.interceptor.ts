import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const auth = this.authService.authValue;
    const isLoggedIn = auth.active;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    const isRefresh = request.url.endsWith('/auth/refresh');
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${
            isRefresh ? auth.refreshToken : auth.accessToken
          }`,
        },
      });
    }

    return next.handle(request);
  }
}
