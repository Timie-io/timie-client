import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { EntryView } from '../_models/entry-view.model';
import { Project } from '../_models/project.model';
import { Team } from '../_models/team.model';
import { User } from '../_models/user.model';
import { fixTimeGap } from '../_utils/date.convert';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import {
  RemoveEntryGQL,
  StartEntryGQL,
  StopEntryGQL,
} from './graphql/entries-mutation.graphql';
import {
  EntriesOnlyGQL,
  EntriesResponse,
  EntriesViewGQL,
  EntriesViewResponse,
} from './graphql/entries-query.graphql';
import {
  EntryAddedGQL,
  EntryChangedInput,
  EntryRemovedGQL,
} from './graphql/entries-subscription.graphql';
import { ProjectsOptionGQL } from './graphql/projects-query.graphql';
import { TeamsOptionGQL } from './graphql/teams-query.graphql';
import { AllUsersQueryGQL } from './graphql/users-query.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {
  error = '';
  search = '';

  private entriesRunningQuery: QueryRef<EntriesResponse>;

  entries: EntryView[] = [];
  private entriesQuery: QueryRef<EntriesViewResponse>;
  onlyMyEntries = true;

  userOptions: User[] = [];
  projectOptions: Project[] = [];
  teamOptions: Team[] = [];

  userId?: string;
  projectId?: string;
  teamId?: string;

  fromTime?: string;
  toTime?: string;

  total = 0;
  page = 1;
  pageSize = 10;

  totalTime = 0;

  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
    private readonly entriesViewGQL: EntriesViewGQL,
    private readonly entriesOnlyGQL: EntriesOnlyGQL,
    private readonly entryAddedGQL: EntryAddedGQL,
    private readonly entryRemovedGQL: EntryRemovedGQL,
    private readonly removeEntryGQL: RemoveEntryGQL,
    private readonly startEntryGQL: StartEntryGQL,
    private readonly stopEntryGQL: StopEntryGQL,
    private readonly sortService: SortService,
    private readonly allUsersGQL: AllUsersQueryGQL,
    private readonly projectsOptionGQL: ProjectsOptionGQL,
    private readonly teamsOptionGQL: TeamsOptionGQL
  ) {
    this.entriesQuery = this.entriesViewGQL.watch();
    this.entriesRunningQuery = this.entriesOnlyGQL.watch();
    this.unsubscribeAdded = this.subscribeToEntryAdded();
    this.unsubscribeRemoved = this.subscribeToEntryRemoved();
    this.authService.user$.subscribe((user) => {
      if (user && user.id) {
        this.checkRunningEntries();
        this.applyFilters();
      }
    });
    this.allUsersGQL
      .watch()
      .refetch()
      .then(({ data }) => {
        this.userOptions = data.users;
      });
    this.projectsOptionGQL
      .watch()
      .refetch()
      .then(({ data }) => {
        this.projectOptions = data.projects.result;
      });
    this.teamsOptionGQL
      .watch()
      .refetch()
      .then(({ data }) => {
        this.teamOptions = data.teams.result;
      });
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      search: this.search || undefined,
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    filters['userId'] = this.userId;
    filters['projectId'] = this.projectId;
    filters['teamId'] = this.teamId;
    if (this.onlyMyEntries) {
      filters['userId'] = this.authService.user?.id;
    }
    if (this.fromTime) {
      filters['fromTime'] = fixTimeGap(this.fromTime, true);
    }
    if (this.toTime) {
      filters['toTime'] = fixTimeGap(this.toTime, true);
    }
    const sortOptions = this.sortService.getSortOptions('entries');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
    return filters;
  }

  applyFilters() {
    this.entriesQuery.setVariables(this.filters);
    this.entriesQuery.refetch().then(({ data }) => {
      this.total = data.entriesView.total;
      this.entries = data.entriesView.result;
      this.totalTime = data.entriesView.totalTime;
    });
    this.unsubscribeAdded = this.subscribeToEntryAdded();
    this.unsubscribeRemoved = this.subscribeToEntryRemoved();
  }

  private subscribeToEntryAdded(input?: EntryChangedInput) {
    this.unsubscribeAdded();
    return this.entriesQuery.subscribeToMore({
      document: this.entryAddedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        this.applyFilters();
        return prev;
      },
    });
  }

  private subscribeToEntryRemoved(input?: EntryChangedInput) {
    this.unsubscribeRemoved();
    return this.entriesQuery.subscribeToMore({
      document: this.entryRemovedGQL.document,
      variables: { input: input },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        this.applyFilters();
        return prev;
      },
    });
  }

  startEntry$(id: string) {
    return this.startEntryGQL.mutate({ id: id });
  }

  stopEntry$(id: string) {
    return this.stopEntryGQL.mutate({ id: id });
  }

  stopEntry(id: string) {
    this.stopEntry$(id).subscribe({
      next: async ({ data }) => {
        if (data?.stopEntry) {
          this.applyFilters();
          this.checkRunningEntries();
        }
      },
    });
  }

  checkRunningEntries() {
    this.entriesRunningQuery.setVariables({
      isRunning: true,
      userId: this.authService.user?.id,
    });
    this.entriesRunningQuery.refetch().then(({ data }) => {
      if (data.entries.result.length > 0) {
        this.appService.setRunning();
      } else {
        this.appService.setStopped();
      }
    });
  }

  removeEntry(entryId: string) {
    this.removeEntryGQL.mutate({ id: entryId }).subscribe({
      next: async () => {
        this.checkRunningEntries();
      },
    });
  }
}
