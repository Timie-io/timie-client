import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthService } from './../_services/auth.service';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  loading = true;

  currentUserSub: Subscription;

  private userNameSubject: BehaviorSubject<string | null>;
  userName$: Observable<string | null>;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal
  ) {
    this.userNameSubject = new BehaviorSubject<string | null>(null);
    this.userName$ = this.userNameSubject.asObservable();
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      if (user) {
        this.userNameSubject.next(user.name);
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.currentUserSub.unsubscribe();
  }

  showProfile() {
    this.modalService.open(ProfileModalComponent);
  }

  userLogout() {
    this.authService.logout();
  }

  get currentUser$() {
    return;
  }
}
