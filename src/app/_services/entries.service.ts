import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { Entry } from '../_models/entry.model';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import {
  RemoveEntryGQL,
  StartEntryGQL,
  StopEntryGQL,
} from './graphql/entries-mutation.graphql';
import { EntriesGQL, EntriesResponse } from './graphql/entries-query.graphql';
import {
  EntryAddedGQL,
  EntryChangedInput,
  EntryRemovedGQL,
} from './graphql/entries-subscription.graphql';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {
  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  error = '';
  search = '';

  entries: Entry[] = [];
  private entriesQuery: QueryRef<EntriesResponse>;
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
    private readonly entriesFullGQL: EntriesGQL,
    private readonly entryAddedGQL: EntryAddedGQL,
    private readonly entryRemovedGQL: EntryRemovedGQL,
    private readonly removeEntryGQL: RemoveEntryGQL,
    private readonly startEntryGQL: StartEntryGQL,
    private readonly stopEntryGQL: StopEntryGQL
  ) {
    this.entriesQuery = this.entriesFullGQL.watch(this.filters);
    this.entriesQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.entries.total;
      this.entries = data.entries.result;
      this.totalTime = data.entries.totalTime;
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
      note: this.search || undefined,
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    if (this.onlyMyEntries) {
      filters['userId'] = this.authService.user?.id;
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
    this.appService.setRunning();
    return this.startEntryGQL.mutate({ id: id });
  }

  stopEntry$(id: string) {
    this.appService.setStopped();
    return this.stopEntryGQL.mutate({ id: id });
  }

  stopEntry(id: string) {
    this.stopEntry$(id).subscribe({
      next: ({ data }) => {
        if (data?.stopEntry) {
          this.totalTime += this.calculateTotal(data.stopEntry);
        }
      },
    });
  }

  removeEntry(entry: Entry) {
    this.removeEntryGQL.mutate({ id: entry.id }).subscribe();
  }

  calculateTotal(entry: Entry): number {
    if (entry.startTime && entry.finishTime) {
      return Number(entry.finishTime) - Number(entry.startTime);
    }
    return 0;
  }
}
