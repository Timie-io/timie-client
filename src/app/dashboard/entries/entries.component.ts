import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Entry } from './../../_models/entry.model';
import { AuthService } from './../../_services/auth.service';
import { EntriesService } from './../../_services/entries.service';
import { RemoveEntryGQL } from './../../_services/graphql/entries-mutation.graphql';
import {
  EntriesGQL,
  EntriesResponse,
} from './../../_services/graphql/entries-query.graphql';
import {
  EntryAddedGQL,
  EntryChangedInput,
  EntryRemovedGQL,
} from './../../_services/graphql/entries-subscription.graphql';
import { EntryModalComponent } from './entry-modal/entry-modal.component';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
})
export class EntriesComponent implements OnInit, OnDestroy {
  error = '';

  search = '';
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  entries: Entry[] = [];
  private entriesQuery: QueryRef<EntriesResponse>;
  onlyMyEntries = true;

  private currentUserSub: Subscription;

  total = 0;
  page = 1;
  pageSize = 50;
  totalTime = 0;

  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  constructor(
    private readonly authService: AuthService,
    private readonly entriesGQL: EntriesGQL,
    private readonly entryAddedGQL: EntryAddedGQL,
    private readonly entryRemovedGQL: EntryRemovedGQL,
    private readonly removeEntryGQL: RemoveEntryGQL,
    private readonly entriesService: EntriesService,
    private readonly modalService: NgbModal
  ) {
    this.entriesQuery = this.entriesGQL.watch();
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.applyFilters();
      });
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      if (user && this.onlyMyEntries) {
        this.applyFilters();
      }
    });
  }

  ngOnInit(): void {
    this.applyFilters();
    this.entriesQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.entries.total;
      this.entries = data.entries.result;
      this.totalTime = data.entries.totalTime;
    });
    this.unsubscribeAdded = this.subscribeToEntryAdded();
    this.unsubscribeRemoved = this.subscribeToEntryRemoved();
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.currentUserSub.unsubscribe();
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

  private applyFilters() {
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
        const entryAdded = subscriptionData.data.entryAdded;

        return {
          ...prev,
          entries: {
            __typename: 'EntriesResult',
            total: prev.entries.total + 1,
            totalTime: prev.entries.totalTime + this.calculateTotal(entryAdded),
            result: [entryAdded, ...prev.entries.result],
          },
        };
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
        const entryRemoved = subscriptionData.data.entryRemoved;
        const newEntryList = prev.entries.result.filter(
          (entry) => entry.id !== entryRemoved.id
        );
        const newTotalTime =
          prev.entries.totalTime - this.calculateTotal(entryRemoved);
        return {
          ...prev,
          entries: {
            __typename: 'EntriesResult',
            total: prev.entries.total - 1,
            totalTime: newTotalTime,
            result: newEntryList,
          },
        };
      },
    });
  }

  onPageChange() {
    this.applyFilters();
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onMyEntriesChange() {
    this.onlyMyEntries = !this.onlyMyEntries;
    this.applyFilters();
  }

  stopEntry(entry: Entry) {
    this.entriesService.stopEntry$(entry.id).subscribe({
      next: ({ data }) => {
        if (data?.stopEntry) {
          this.totalTime += this.calculateTotal(data.stopEntry);
        }
      },
    });
  }

  removeEntry(entry: Entry) {
    if (confirm('Are you sure about removing this entry?')) {
      this.removeEntryGQL.mutate({ id: entry.id }).subscribe();
    }
  }

  newEntry() {
    this.modalService.open(EntryModalComponent);
  }

  calculateTotal(entry: Entry): number {
    if (entry.startTime && entry.finishTime) {
      return Number(entry.finishTime) - Number(entry.startTime);
    }
    return 0;
  }
}
