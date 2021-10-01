import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Project } from './../../_models/project.model';
import { AuthService } from './../../_services/auth.service';
import { ProjectsService } from './../../_services/projects.service';
import { SortService, SortUpdate } from './../../_services/sort.service';
import { ProjectModalComponent } from './project-modal/project-modal.component';

interface EditProjectInput {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  private sortedColumnsSub: Subscription;
  sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly sortService: SortService,
    private readonly authService: AuthService,
    private readonly modalService: NgbModal
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.projectsService.search = value;
        this.projectsService.applyFilters();
      });
    this.sortedColumnsSub = this.sortService.sortUpdate$.subscribe(
      (sortUpdate: SortUpdate) => {
        if (sortUpdate[0] === 'projects') {
          this.sortedColumns[sortUpdate[1]] = sortUpdate[2];
        }
      }
    );
  }

  get projects() {
    return this.projectsService.projects;
  }

  get error() {
    return this.projectsService.error;
  }

  set error(value: string) {
    this.projectsService.error = value;
  }

  get search() {
    return this.projectsService.search;
  }

  set search(value: string) {
    this.projectsService.search = value;
  }

  get onlyActive() {
    return this.projectsService.onlyActive;
  }

  set onlyActive(value: boolean) {
    this.projectsService.onlyActive = value;
  }

  get page() {
    return this.projectsService.page;
  }

  set page(value: number) {
    this.projectsService.page = value;
  }

  get pageSize() {
    return this.projectsService.pageSize;
  }

  get total() {
    return this.projectsService.total;
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.searchSub.unsubscribe();
    this.sortedColumnsSub.unsubscribe();
  }

  get currentUser() {
    return this.authService.user;
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onActiveChange() {
    this.onlyActive = !this.onlyActive;
    this.projectsService.applyFilters();
  }

  onPageChange() {
    this.projectsService.applyFilters();
  }

  newProject() {
    this.modalService.open(ProjectModalComponent);
  }

  editProject(project: EditProjectInput) {
    const modal = this.modalService.open(ProjectModalComponent);
    modal.componentInstance.id = project.id;
    modal.componentInstance.name = project.name;
    modal.componentInstance.description = project.description;
    modal.componentInstance.active = project.active;
  }

  removeProject(project: Project) {
    if (confirm('Are you sure about removing this project?')) {
      this.projectsService.removeProject(project.id);
    }
  }

  toggleSort(column: string) {
    this.sortService.toogleColumn('projects', column);
    this.projectsService.applyFilters();
  }
}
