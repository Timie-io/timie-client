import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../_models/user.model';
import { AuthService } from './../../_services/auth.service';
import { EntriesService } from './../../_services/entries.service';
import { SortService, SortUpdate } from './../../_services/sort.service';
import { EntryModalComponent } from './entry-modal/entry-modal.component';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
})
export class EntriesComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  private currentUserSub: Subscription;
  currentUser: User | null = null;

  private sortedColumnsSub: Subscription;
  sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};

  constructor(
    private readonly authService: AuthService,
    private readonly entriesService: EntriesService,
    private readonly sortService: SortService,
    private readonly modalService: NgbModal
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.entriesService.search = value;
        this.entriesService.applyFilters();
      });
    this.currentUserSub = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
    this.sortedColumnsSub = this.sortService.sortUpdate$.subscribe(
      (sortUpdate: SortUpdate) => {
        if (sortUpdate[0] === 'entries') {
          this.sortedColumns[sortUpdate[1]] = sortUpdate[2];
        }
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.currentUserSub.unsubscribe();
    this.sortedColumnsSub.unsubscribe();
  }

  get entries() {
    return this.entriesService.entries;
  }

  get error() {
    return this.entriesService.error;
  }

  set error(value: string) {
    this.entriesService.error = value;
  }

  get search() {
    return this.entriesService.search;
  }

  set search(value: string) {
    this.entriesService.search = value;
  }

  get onlyMyEntries() {
    return this.entriesService.onlyMyEntries;
  }

  set onlyMyEntries(value: boolean) {
    this.entriesService.onlyMyEntries = value;
  }

  get total() {
    return this.entriesService.total;
  }

  get page() {
    return this.entriesService.page;
  }

  set page(value: number) {
    this.entriesService.page = value;
  }

  get pageSize() {
    return this.entriesService.pageSize;
  }

  get totalTime() {
    return this.entriesService.totalTime;
  }

  onPageChange() {
    this.entriesService.applyFilters();
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onMyEntriesChange() {
    this.onlyMyEntries = !this.onlyMyEntries;
    this.entriesService.applyFilters();
  }

  stopEntry(entryId: string) {
    this.entriesService.stopEntry(entryId);
  }

  removeEntry(entryId: string) {
    if (confirm('Are you sure about removing this entry?')) {
      this.entriesService.removeEntry(entryId);
    }
  }

  newEntry() {
    this.modalService.open(EntryModalComponent);
  }

  toggleSort(column: string) {
    this.sortService.toogleColumn('entries', column);
    this.entriesService.applyFilters();
  }
}
