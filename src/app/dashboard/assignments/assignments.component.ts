import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Assignment } from './../../_models/assignment.model';
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
export class AssignmentsComponent implements OnInit {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly router: Router,
    private readonly updateAssignmentGQL: UpdateAssignmentGQL,
    private readonly createEntryGQL: CreateEntryGQL,
    private readonly entriesService: EntriesService
  ) {}

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

  ngOnInit(): void {}

  onStatusChange(statusCode: string, assignment: Assignment) {
    this.updateAssignmentGQL
      .mutate({
        id: assignment.id,
        data: {
          statusCode: statusCode,
        },
      })
      .subscribe();
  }

  onStatusFilterChange() {
    this.assignmentsService.applyFilters();
  }

  onPageChange() {
    this.assignmentsService.applyFilters();
  }

  private newEntryInput(assignmentId: string): NewEntryInput {
    if (!this.assignmentsService.userId) {
      this.assignmentsService.error = 'Unexpected error';
    }
    return {
      userId: this.assignmentsService.userId || '',
      assignmentId: assignmentId,
    };
  }

  startNewEntry(assignment: Assignment) {
    this.createEntryGQL
      .mutate({ data: this.newEntryInput(assignment.id) })
      .subscribe({
        next: ({ data }) => {
          if (data) {
            this.entriesService.startEntry$(data.createEntry.id).subscribe({
              next: () => {
                this.router.navigate(['/entries']);
              },
            });
          }
        },
        error: (error) => {
          this.assignmentsService.error = error;
        },
      });
  }
}
