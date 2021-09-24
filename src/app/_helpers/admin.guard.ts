import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { filter, first } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = await this.authService.user$
      .pipe(
        filter((user) => user !== null),
        first()
      )
      .toPromise();
    return user?.isAdmin ? true : false;
  }
}
