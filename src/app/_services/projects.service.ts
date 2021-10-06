import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { ProjectView } from '../_models/project-view.model';
import { RemoveProjectGQL } from './graphql/projects-mutation.graphql';
import {
  ProjectsViewGQL,
  ProjectsViewResponse,
} from './graphql/projects-query.graphql';
import {
  ProjectAddedGQL,
  ProjectRemovedGQL,
} from './graphql/projects-subscription.graphql';
import { SortService } from './sort.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private projectsQuery: QueryRef<ProjectsViewResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  projects: ProjectView[] = [];

  search = '';

  onlyActive = true;

  constructor(
    private readonly projectsViewGQL: ProjectsViewGQL,
    private readonly projectAddedGQL: ProjectAddedGQL,
    private readonly projectRemovedGQL: ProjectRemovedGQL,
    private readonly removeProjectGQL: RemoveProjectGQL,
    private readonly sortService: SortService
  ) {
    this.projectsQuery = this.projectsViewGQL.watch();
    this.unsubscribeAdded = this.subscribeToProjectAdded();
    this.unsubscribeRemoved = this.subscribeToProjectRemoved();
    this.applyFilters();
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    filters['search'] = this.search || undefined;
    filters['active'] = this.onlyActive || undefined;
    const sortOptions = this.sortService.getSortOptions('projects');
    if (sortOptions.length > 0) {
      filters['sortBy'] = sortOptions;
    }
    return filters;
  }

  applyFilters() {
    this.projectsQuery.setVariables(this.filters);
    this.projectsQuery.refetch().then(({ data }) => {
      this.total = data.projectsView.total;
      this.projects = data.projectsView.result;
    });
  }

  private subscribeToProjectAdded() {
    this.unsubscribeAdded();
    return this.projectsQuery.subscribeToMore({
      document: this.projectAddedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        this.applyFilters();
        return prev;
      },
    });
  }

  private subscribeToProjectRemoved() {
    this.unsubscribeRemoved();
    return this.projectsQuery.subscribeToMore({
      document: this.projectRemovedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        this.applyFilters();
        return prev;
      },
    });
  }

  removeProject(projectId: string) {
    this.removeProjectGQL.mutate({ id: projectId }).subscribe({
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
