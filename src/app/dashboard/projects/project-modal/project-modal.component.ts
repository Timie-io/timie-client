import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryRef } from 'apollo-angular';
import { first } from 'rxjs/operators';
import {
  CreateProjectGQL,
  NewProjectInput,
  UpdateProjectGQL,
  UpdateProjectInput,
} from '../../../_services/graphql/projects-mutation.graphql';
import { Team } from './../../../_models/team.model';
import {
  TeamsOptionGQL,
  TeamsOptionResponse,
} from './../../../_services/graphql/teams-query.graphql';
import { ProjectsService } from './../../../_services/projects.service';

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css'],
})
export class ProjectModalComponent implements OnInit {
  @Input() id?: string;
  @Input() name?: string;
  @Input() description?: string;
  @Input() active: boolean = true;
  @Input() team?: Team;

  teams: Team[] = [];
  private teamsOptionQuery: QueryRef<TeamsOptionResponse>;

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private createProjectGQL: CreateProjectGQL,
    private updateProjectGQL: UpdateProjectGQL,
    private teamsOptionGQL: TeamsOptionGQL,
    private readonly projectsService: ProjectsService
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      teamId: [''],
      active: [false],
    });
    this.teamsOptionQuery = this.teamsOptionGQL.watch();
  }

  ngOnInit(): void {
    this.form.controls.name.setValue(this.name);
    this.form.controls.description.setValue(this.description);
    this.form.controls.active.setValue(this.active);
    this.form.controls.teamId.setValue(this.team?.id);
    this.teamsOptionQuery.valueChanges.subscribe(({ data }) => {
      this.teams = data.teams.result;
    });
    this.teamsOptionQuery.refetch();
  }

  get f() {
    return this.form.controls;
  }

  private get updateProjectInput(): UpdateProjectInput {
    return {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
      active: this.form.controls.active.value,
    };
  }

  private get newProjectInput(): NewProjectInput {
    return {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
      active: this.form.controls.active.value,
    };
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    if (this.id) {
      this.loading = true;
      this.updateProjectGQL
        .mutate({ id: this.id, data: this.updateProjectInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.projectsService.applyFilters();
            this.modal.close('Project saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    } else {
      this.loading = true;
      this.createProjectGQL
        .mutate({
          data: this.newProjectInput,
          teamId: this.form.controls.teamId.value,
        })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Project saved');
          },
          error: (error) => {
            if (error.message.includes('duplicate key')) {
              this.error = 'Team with the same name already exists';
            } else {
              this.error = error;
            }
            this.loading = false;
          },
        });
    }
  }
}
