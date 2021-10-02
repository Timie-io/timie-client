import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SortUpdate } from '../../_services/sort.service';
import { AuthService } from './../../_services/auth.service';
import { SortService } from './../../_services/sort.service';
import { TeamsService } from './../../_services/teams.service';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamModalComponent } from './team-modal/team-modal.component';

interface EditTeamInput {
  id: string;
  name: string;
  description: string;
}

interface EditMembersInput {
  id: string;
  name: string;
}

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  private sortedColumnsSub: Subscription;
  sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};

  constructor(
    private readonly teamsService: TeamsService,
    private readonly sortService: SortService,
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
    this.sortedColumnsSub = this.sortService.sortUpdate$.subscribe(
      (sortUpdate: SortUpdate) => {
        if (sortUpdate[0] === 'teams') {
          this.sortedColumns[sortUpdate[1]] = sortUpdate[2];
        }
      }
    );
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

  ngOnInit() {
    this.teamsService.applyFilters();
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.sortedColumnsSub.unsubscribe();
  }

  newTeam() {
    this.modalService.open(TeamModalComponent);
  }

  public get currentUser() {
    return this.authService.user;
  }

  editTeam(team: EditTeamInput) {
    const modal = this.modalService.open(TeamModalComponent);
    modal.componentInstance.id = team.id;
    modal.componentInstance.name = team.name;
    modal.componentInstance.description = team.description;
  }

  editMembers(team: EditMembersInput) {
    const modal = this.modalService.open(TeamMembersComponent);
    modal.componentInstance.id = team.id;
    modal.componentInstance.name = team.name;
  }

  removeTeam(teamId: string) {
    if (confirm('Are you sure about removing this team?')) {
      this.teamsService.removeTeam(teamId);
    }
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onPageChange() {
    this.teamsService.applyFilters();
  }

  toggleSort(column: string) {
    this.sortService.toogleColumn('teams', column);
    this.teamsService.applyFilters();
  }
}
