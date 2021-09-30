import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { Project } from '../_models/project.model';
import { RemoveProjectGQL } from './graphql/projects-mutation.graphql';
import {
  AllProjectsGQL,
  AllProjectsResponse,
} from './graphql/projects-query.graphql';
import {
  ProjectAddedGQL,
  ProjectRemovedGQL,
} from './graphql/projects-subscription.graphql';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private projectsQuery: QueryRef<AllProjectsResponse>;
  private unsubscribeAdded = () => {};
  private unsubscribeRemoved = () => {};

  error = '';

  page = 1;
  pageSize = 10;
  total = 0;

  projects: Project[] = [];

  search = '';

  onlyActive = true;

  constructor(
    private readonly allProjectsGQL: AllProjectsGQL,
    private readonly projectAddedGQL: ProjectAddedGQL,
    private readonly projectRemovedGQL: ProjectRemovedGQL,
    private readonly removeProjectGQL: RemoveProjectGQL
  ) {
    this.projectsQuery = this.allProjectsGQL.watch(this.filters);
    this.projectsQuery.valueChanges.subscribe(({ data }) => {
      this.total = data.projects.total;
      this.projects = data.projects.result;
    });
    this.unsubscribeAdded = this.subscribeToProjectAdded();
    this.unsubscribeRemoved = this.subscribeToProjectRemoved();
  }

  private get filters() {
    const filters: { [id: string]: any } = {
      skip: (this.page - 1) * this.pageSize,
      take: this.pageSize,
    };
    filters['name'] = this.search || undefined;
    filters['active'] = this.onlyActive || undefined;
    return filters;
  }

  applyFilters() {
    this.projectsQuery.setVariables(this.filters);
    this.projectsQuery.refetch();
  }

  private subscribeToProjectAdded() {
    this.unsubscribeAdded();
    return this.projectsQuery.subscribeToMore({
      document: this.projectAddedGQL.document,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(subscriptionData);
        if (!subscriptionData) {
          return prev;
        }
        const projectAdded = subscriptionData.data.projectAdded;
        const newList = prev.projects.result.filter(
          (project) => project.id !== projectAdded.id
        );

        return {
          ...prev,
          projects: {
            __typename: 'ProjectsResult',
            total: prev.projects.total + 1,
            result: [projectAdded, ...newList],
          },
        };
      },
    });
  }

  private subscribeToProjectRemoved() {
    this.unsubscribeRemoved();
    return this.projectsQuery.subscribeToMore({
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

  removeProject(project: Project) {
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
