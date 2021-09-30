import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { Team } from '../_models/team.model';
import { RemoveTeamGQL } from './graphql/teams-mutation.graphql';
import { AllTeamsGQL, AllTeamsResponse } from './graphql/teams-query.graphql';
import {
  TeamAddedGQL,
  TeamRemovedGQL,
} from './graphql/teams-subscription.graphql';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private teamsQuery: QueryRef<AllTeamsResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  teams: Team[] = [];

  search = '';

  constructor(
    private readonly allTeamsGQL: AllTeamsGQL,
    private readonly teamAddedGQL: TeamAddedGQL,
    private readonly teamRemovedGQL: TeamRemovedGQL,
    private readonly removeTeamGQL: RemoveTeamGQL
  ) {
    this.teamsQuery = this.allTeamsGQL.watch(this.filters);
    this.teamsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.teams.total;
      this.teams = data.teams.result;
    });
    this.unsubscribeAdded = this.subscribeToTeamAdded();
    this.unsubscribeRemoved = this.subscribeToTeamRemoved();
  }

  applyFilters() {
    this.teamsQuery.setVariables(this.filters);
    this.teamsQuery.refetch();
    this.unsubscribeAdded = this.subscribeToTeamAdded();
    this.unsubscribeRemoved = this.subscribeToTeamRemoved();
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    filters['name'] = this.search || undefined;
    return filters;
  }

  private subscribeToTeamAdded() {
    this.unsubscribeAdded();
    return this.teamsQuery.subscribeToMore({
      document: this.teamAddedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const teamAdded = subscriptionData.data.teamAdded;
        const newTeamList = prev.teams.result.filter(
          (team) => team.id !== teamAdded.id
        );

        return {
          ...prev,
          teams: {
            __typename: 'TeamsResult',
            total: prev.teams.total + 1,
            result: [teamAdded, ...newTeamList],
          },
        };
      },
    });
  }

  private subscribeToTeamRemoved() {
    this.unsubscribeRemoved();
    return this.teamsQuery.subscribeToMore({
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

  removeTeam(team: Team) {
    this.removeTeamGQL.mutate({ id: team.id }).subscribe({
      next: () => {
        this.error = '';
      },
      error: (error) => {
        if (
          error.message.includes(
            'violates foreign key constraint',
            'on table "project"'
          )
        ) {
          this.error = 'There are still projects associated with this team';
        } else {
          this.error = error;
        }
      },
    });
  }
}
