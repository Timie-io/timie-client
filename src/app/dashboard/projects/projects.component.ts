import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RemoveProjectGQL } from '../../_services/graphql/projects-mutation.graphql';
import {
  AllProjectsGQL,
  AllProjectsResponse,
} from '../../_services/graphql/projects-query.graphql';
import {
  ProjectAddedGQL,
  ProjectRemovedGQL,
} from '../../_services/graphql/projects-subscription.graphql';
import { Project } from './../../_models/project.model';
import { AuthService } from './../../_services/auth.service';
import { ProjectModalComponent } from './project-modal/project-modal.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private projectsQuery: QueryRef<AllProjectsResponse>;

  public total = 0;
  public projects: Project[] = [];

  public error = '';

  public search = '';
  private searchChanged: Subject<string> = new Subject<string>();
  private searchSub: Subscription;

  onlyActive = true;

  constructor(
    private readonly authService: AuthService,
    private readonly modalService: NgbModal,
    private readonly allProjectsGQL: AllProjectsGQL,
    private readonly removeProjectGQL: RemoveProjectGQL,
    private readonly projectAddedGQL: ProjectAddedGQL,
    private readonly projectRemovedGQL: ProjectRemovedGQL
  ) {
    // Add debounce time for searching
    this.searchSub = this.searchChanged
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.projectsQuery.setVariables(this.filters);
      });
    this.projectsQuery = this.allProjectsGQL.watch(this.filters);
  }

  ngOnInit(): void {
    this.projectsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.projects.total;
      this.projects = data.projects.result;
    });
    this.projectsQuery.subscribeToMore({
      document: this.projectAddedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(subscriptionData);
        if (!subscriptionData) {
          return prev;
        }
        const projectAdded = subscriptionData.data.projectAdded;

        return {
          ...prev,
          projects: {
            __typename: 'ProjectsResult',
            total: prev.projects.total + 1,
            result: [projectAdded, ...prev.projects.result],
          },
        };
      },
    });
    this.projectsQuery.subscribeToMore({
      document: this.projectRemovedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(subscriptionData);
        if (!subscriptionData) {
          return prev;
        }
        const projectRemoved = subscriptionData.data.projectRemoved;
        const newProjectList = prev.projects.result.filter(
          (project) => project.id !== projectRemoved.id
        );

        return {
          ...prev,
          projects: {
            __typename: 'ProjectsResult',
            total: prev.projects.total - 1,
            result: newProjectList,
          },
        };
      },
    });
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe();
  }

  get currentUser() {
    return this.authService.user;
  }

  private get filters() {
    const filters: { [id: string]: any } = {};
    filters['name'] = this.search || undefined;
    filters['active'] = this.onlyActive || undefined;
    return filters;
  }

  onSearchChange(value: string) {
    this.searchChanged.next(value);
  }

  onActiveChange() {
    this.onlyActive = !this.onlyActive;
    this.projectsQuery.setVariables(this.filters);
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
      this.removeProjectGQL.mutate({ id: project.id }).subscribe({
        next: () => {
          this.error = '';
        },
        error: (error) => {
          if (
            error.message.includes(
              'violates foreign key constraint',
              'on table "task"'
            )
          ) {
            this.error = 'There are still tasks associated with this project';
          } else {
            this.error = error;
          }
        },
      });
    }
  }
}
