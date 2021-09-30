import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Project } from './../../_models/project.model';
import { AuthService } from './../../_services/auth.service';
import { ProjectsService } from './../../_services/projects.service';
import { ProjectModalComponent } from './project-modal/project-modal.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  constructor(
    private readonly projectsService: ProjectsService,
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

  editProject(project: Project) {
    const modal = this.modalService.open(ProjectModalComponent);
    modal.componentInstance.id = project.id;
    modal.componentInstance.name = project.name;
    modal.componentInstance.description = project.description;
    modal.componentInstance.active = project.active;
  }

  removeProject(project: Project) {
    if (confirm('Are you sure about removing this project?')) {
      this.projectsService.removeProject(project);
    }
  }
}
