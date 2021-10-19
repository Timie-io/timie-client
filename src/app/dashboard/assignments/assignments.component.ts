import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SortService, SortUpdate } from '../../_services/sort.service';
import { AppService } from './../../_services/app.service';
import { AssignmentsService } from './../../_services/assignments.service';
import { EntriesService } from './../../_services/entries.service';
import { UpdateAssignmentGQL } from './../../_services/graphql/assignments-mutation.graphql';
import {
  CreateEntryGQL,
  NewEntryInput,
} from './../../_services/graphql/entries-mutation.graphql';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css'],
})
export class AssignmentsComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  private sortedColumnsSub: Subscription;
  sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};

  constructor(
    private readonly appService: AppService,
    private readonly assignmentsService: AssignmentsService,
    private readonly router: Router,
    private readonly updateAssignmentGQL: UpdateAssignmentGQL,
    private readonly createEntryGQL: CreateEntryGQL,
    private readonly entriesService: EntriesService,
    private readonly sortService: SortService
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.assignmentsService.search = value;
        this.assignmentsService.applyFilters();
      });
    this.sortedColumnsSub = this.sortService.sortUpdate$.subscribe(
      (sortUpdate: SortUpdate) => {
        if (sortUpdate[0] === 'assignments') {
          this.sortedColumns[sortUpdate[1]] = sortUpdate[2];
        }
      }
    );
  }

  get assignments() {
    return this.assignmentsService.assignments;
  }

  get allStatus() {
    return this.assignmentsService.allStatus;
  }

  get statusSelected() {
    return this.assignmentsService.statusSelected;
  }

  set statusSelected(value: string) {
    this.assignmentsService.statusSelected = value;
  }

  get page() {
    return this.assignmentsService.page;
  }

  set page(value: number) {
    this.assignmentsService.page = value;
  }

  get pageSize() {
    return this.assignmentsService.pageSize;
  }

  get total() {
    return this.assignmentsService.total;
  }

  get error() {
    return this.assignmentsService.error;
  }

  set error(value: string) {
    this.assignmentsService.error = value;
  }

  get search() {
    return this.assignmentsService.search;
  }

  set search(value: string) {
    this.assignmentsService.search = value;
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.sortedColumnsSub.unsubscribe();
  }

  onStatusChange(statusCode: string, assignmentId: string) {
    this.updateAssignmentGQL
      .mutate({
        id: assignmentId,
        data: {
          statusCode: statusCode,
        },
      })
      .subscribe({
        complete: () => {
          this.assignmentsService.applyFilters();
        },
      });
  }

  onStatusFilterChange() {
    this.assignmentsService.applyFilters();
  }

  onPageChange() {
    this.assignmentsService.applyFilters();
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  private newEntryInput(assignmentId: string): NewEntryInput {
    if (!this.assignmentsService.userId) {
      this.assignmentsService.error = 'Unexpected error';
    }
    return {
      assignmentId: assignmentId,
    };
  }

  startNewEntry(assignmentId: string) {
    this.createEntryGQL
      .mutate({ data: this.newEntryInput(assignmentId) })
      .subscribe({
        next: ({ data }) => {
          if (data) {
            this.entriesService.startEntry$(data.createEntry.id).subscribe({
              next: (data) => {
                this.appService.setRunning();
                this.entriesService.applyFilters();
                this.router.navigate(['/entries']);
              },
              error: (error) => {
                this.entriesService.error = 'An unexpected error happened';
              },
            });
          }
        },
        error: (error) => {
          this.assignmentsService.error = error;
        },
      });
  }

  toggleSort(column: string) {
    this.sortService.toogleColumn('assignments', column);
    this.assignmentsService.applyFilters();
  }
}
