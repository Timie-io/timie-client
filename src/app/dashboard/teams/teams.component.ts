import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Team } from '../../_models/team.model';
import { AuthService } from './../../_services/auth.service';
import { AllTeamsGQL, AllTeamsResponse } from './graphql/teams-query.graphql';
import { TeamAddedGQL } from './graphql/teams-subscription.graphql';
import { TeamModalComponent } from './team-modal/team-modal.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
})
export class TeamsComponent implements OnInit {
  public loading = true;
  private teamsQuery: QueryRef<AllTeamsResponse>;
  public teams: Team[] = [];
  public total: number = 0;

  constructor(
    private readonly allTeamsGQL: AllTeamsGQL,
    private readonly teamAddedGQL: TeamAddedGQL,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {
    this.teamsQuery = this.allTeamsGQL.watch();
  }

  ngOnInit() {
    this.teamsQuery.valueChanges.subscribe(({ data }) => {
      console.log(data);
      this.total = data.teams.total;
      this.teams = data.teams.result;
    });
    this.teamsQuery.subscribeToMore({
      document: this.teamAddedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const teamAdded = subscriptionData.data.teamAdded;

        console.log('New team added', teamAdded);

        return {
          ...prev,
          teams: {
            total: prev.teams.total + 1,
            result: [teamAdded, ...prev.teams.result],
          },
        };
      },
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
