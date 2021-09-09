import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { Team } from '../../_models/team.model';
import { AuthService } from './../../_services/auth.service';
import { AllTeamsGQL } from './graphql/teams-query.graphql';
import { TeamModalComponent } from './team-modal/team-modal.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit {
  public loading = true;
  public teams: Team[] = [];
  public total: number = 0;

  constructor(
    private readonly allTeamsGQL: AllTeamsGQL,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    console.log('Fetch teams');
    this.allTeamsGQL
      .fetch()
      .pipe(first())
      .subscribe(({ data }) => {
        this.total = data.teams.total;
        this.teams = data.teams.result;
      });
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
}
