import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { EntryView } from '../_models/entry-view.model';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import {
  RemoveEntryGQL,
  StartEntryGQL,
  StopEntryGQL,
} from './graphql/entries-mutation.graphql';
import {
  EntriesViewGQL,
  EntriesViewResponse,
} from './graphql/entries-query.graphql';
import {
  EntryAddedGQL,
  EntryChangedInput,
  EntryRemovedGQL,
} from './graphql/entries-subscription.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {
  error = '';
  search = '';

  entries: EntryView[] = [];
  private entriesQuery: QueryRef<EntriesViewResponse>;
  onlyMyEntries = true;

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
    private readonly entryAddedGQL: EntryAddedGQL,
    private readonly entryRemovedGQL: EntryRemovedGQL,
    private readonly removeEntryGQL: RemoveEntryGQL,
    private readonly startEntryGQL: StartEntryGQL,
    private readonly stopEntryGQL: StopEntryGQL,
    private readonly sortService: SortService
  ) {
    this.entriesQuery = this.entriesViewGQL.watch(this.filters);
    this.entriesQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.entriesView.total;
      this.entries = data.entriesView.result;
      this.totalTime = data.entriesView.totalTime;
    });
    this.unsubscribeAdded = this.subscribeToEntryAdded();
    this.unsubscribeRemoved = this.subscribeToEntryRemoved();
    this.authService.user$.subscribe((user) => {
      if (user && this.onlyMyEntries) {
        this.applyFilters();
      }
    });
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      search: this.search || undefined,
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    if (this.onlyMyEntries) {
      filters['userId'] = this.authService.user?.id;
    }
    const sortOptions = this.sortService.getSortOptions('entries');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
    return filters;
  }

  applyFilters() {
    this.entriesQuery.setVariables(this.filters);
    this.entriesQuery.refetch();
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
        this.entriesQuery.refetch();
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
        this.entriesQuery.refetch();
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
          await this.appService.updateAppStatus();
          this.entriesQuery.refetch();
        }
      },
    });
  }

  removeEntry(entryId: string) {
    this.removeEntryGQL.mutate({ id: entryId }).subscribe({
      next: async () => {
        await this.appService.updateAppStatus();
      },
    });
  }
}
