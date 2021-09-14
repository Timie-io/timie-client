import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { Team } from './../../../_models/team.model';
import { AllTeamsGQL } from './../../teams/graphql/teams-query.graphql';
import {
  CreateProjectGQL,
  NewProjectInput,
  UpdateProjectGQL,
  UpdateProjectInput,
} from './../graphql/projects-mutation.graphql';

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css'],
})
export class ProjectModalComponent implements OnInit {
  @Input() id?: string;
  @Input() name?: string;
  @Input() description?: string;
  @Input() team?: Team;

  teams: Team[] = [];

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private createProjectGQL: CreateProjectGQL,
    private updateProjectGQL: UpdateProjectGQL,
    private allTeamsGQL: AllTeamsGQL
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      teamId: [''],
    });
  }

  ngOnInit(): void {
    this.form.controls.name.setValue(this.name);
    this.form.controls.description.setValue(this.description);
    this.form.controls.teamId.setValue(this.team?.id);
    this.allTeamsGQL.watch().valueChanges.subscribe(({ data }) => {
      this.teams = data.teams.result;
    });
  }

  get f() {
    return this.form.controls;
  }

  private get updateProjectInput(): UpdateProjectInput {
    return {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
    };
  }

  private get newProjectInput(): NewProjectInput {
    return {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value,
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
            this.error = error;
            this.loading = false;
          },
        });
    }
  }
}
