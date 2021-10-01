import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TeamView } from '../_models/team-view.model';
import { RemoveTeamGQL } from './graphql/teams-mutation.graphql';
import { TeamsViewGQL, TeamsViewResponse } from './graphql/teams-query.graphql';
import {
  TeamAddedGQL,
  TeamRemovedGQL,
} from './graphql/teams-subscription.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private teamsQuery: QueryRef<TeamsViewResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  teams: TeamView[] = [];

  search = '';

  constructor(
    private readonly teamsViewGQL: TeamsViewGQL,
    private readonly teamAddedGQL: TeamAddedGQL,
    private readonly teamRemovedGQL: TeamRemovedGQL,
    private readonly removeTeamGQL: RemoveTeamGQL,
    private readonly sortService: SortService
  ) {
    this.teamsQuery = this.teamsViewGQL.watch(this.filters);
    this.teamsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.teamsView.total;
      this.teams = data.teamsView.result;
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
    filters['search'] = this.search || undefined;
    const sortOptions = this.sortService.getSortOptions('teams');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
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
        this.teamsQuery.refetch();
        return prev;
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
        this.teamsQuery.refetch();
        return prev;
      },
    });
  }
  removeTeam(teamId: string) {
    this.removeTeamGQL.mutate({ id: teamId }).subscribe({
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
