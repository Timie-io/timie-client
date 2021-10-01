import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Entry } from './../../_models/entry.model';
import { EntriesService } from './../../_services/entries.service';
import { EntryModalComponent } from './entry-modal/entry-modal.component';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
})
export class EntriesComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  constructor(
    private readonly entriesService: EntriesService,
    private readonly modalService: NgbModal
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.entriesService.search = value;
        this.entriesService.applyFilters();
      });
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
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

  get totalTime() {
    return this.entriesService.totalTime;
  }

  get pageSize() {
    return this.entriesService.pageSize;
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

  stopEntry(entry: Entry) {
    this.entriesService.stopEntry(entry.id);
  }

  removeEntry(entry: Entry) {
    if (confirm('Are you sure about removing this entry?')) {
      this.entriesService.removeEntry(entry);
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
