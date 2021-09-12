import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Team } from '../../_models/team.model';
import { AuthService } from './../../_services/auth.service';
import { RemoveTeamGQL } from './graphql/teams-mutation.graphql';
import { AllTeamsGQL, AllTeamsResponse } from './graphql/teams-query.graphql';
import {
  TeamAddedGQL,
  TeamRemovedGQL,
} from './graphql/teams-subscription.graphql';
import { TeamsStoreService } from './services/teams-store.service';
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
  public error = '';
  public search = '';

  constructor(
    private readonly allTeamsGQL: AllTeamsGQL,
    private readonly removeTeamGQL: RemoveTeamGQL,
    private readonly teamAddedGQL: TeamAddedGQL,
    private readonly teamRemovedGQL: TeamRemovedGQL,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
    private readonly storeService: TeamsStoreService
  ) {
    this.teamsQuery = this.allTeamsGQL.watch();
    this.search = this.storeService.search;
  }

  ngOnInit() {
    this.teamsQuery.valueChanges.subscribe(({ data }) => {
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

        return {
          ...prev,
          teams: {
            __typename: 'TeamsResult',
            total: prev.teams.total + 1,
            result: [teamAdded, ...prev.teams.result],
          },
        };
      },
    });
    this.teamsQuery.subscribeToMore({
      document: this.teamRemovedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const teamRemoved = subscriptionData.data.teamRemoved;
        const newTeamList = prev.teams.result.filter(
          (team) => team.id !== teamRemoved.id
        );

        return {
          ...prev,
          teams: {
            __typename: 'TeamsResult',
            total: prev.teams.total - 1,
            result: newTeamList,
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

  removeTeam(id: string) {
    if (confirm('Are you sure about removing this team?')) {
      this.removeTeamGQL.mutate({ id: id }).subscribe({
        next: () => {
          this.error = '';
        },
        error: (error) => {
          this.error = error;
        },
      });
    }
  }

  onSearchChange() {
    if (this.search.length > 3 || !this.search) {
      this.storeService.search = this.search;
      this.teamsQuery.fetchMore({
        variables: {
          name: this.search,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return fetchMoreResult;
        },
      });
    }
  }
}
