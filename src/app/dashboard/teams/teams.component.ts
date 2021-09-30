import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Team } from '../../_models/team.model';
import { AuthService } from './../../_services/auth.service';
import { TeamsService } from './../../_services/teams.service';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamModalComponent } from './team-modal/team-modal.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  constructor(
    private readonly teamsService: TeamsService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {
    // Applying debounce for search value changes
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.teamsService.applyFilters();
      });
  }

  get teams() {
    return this.teamsService.teams;
  }

  get total() {
    return this.teamsService.total;
  }

  get page() {
    return this.teamsService.page;
  }

  set page(value: number) {
    this.teamsService.page = value;
  }

  get pageSize() {
    return this.teamsService.pageSize;
  }

  get error() {
    return this.teamsService.error;
  }

  set error(value: string) {
    this.teamsService.error = value;
  }

  get search() {
    return this.teamsService.search;
  }

  set search(value: string) {
    this.teamsService.search = value;
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
  }

  newTeam() {
    this.modalService.open(TeamModalComponent);
  }

  public get currentUser() {
    return this.authService.user;
  }

  editTeam(team: Team) {
    const modal = this.modalService.open(TeamModalComponent);
    modal.componentInstance.id = team.id;
    modal.componentInstance.name = team.name;
    modal.componentInstance.description = team.description;
  }

  editMembers(team: Team) {
    const modal = this.modalService.open(TeamMembersComponent);
    modal.componentInstance.id = team.id;
    modal.componentInstance.name = team.name;
  }

  removeTeam(team: Team) {
    if (confirm('Are you sure about removing this team?')) {
      this.teamsService.removeTeam(team);
    }
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onPageChange() {
    this.teamsService.applyFilters();
  }
}
