import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import {
  CreateTeamGQL,
  NewTeamInput,
  UpdateTeamGQL,
  UpdateTeamInput,
} from '../../../_services/graphql/teams-mutation.graphql';
import { TeamsService } from './../../../_services/teams.service';

@Component({
  selector: 'app-team-modal',
  templateUrl: './team-modal.component.html',
  styleUrls: ['./team-modal.component.css'],
})
export class TeamModalComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  @Input() name?: string;
  @Input() description?: string;

  form: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private teamsService: TeamsService,
    private updateTeamGQL: UpdateTeamGQL,
    private createTeamGQL: CreateTeamGQL
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.form.controls.name.setValue(this.name);
    this.form.controls.description.setValue(this.description);
  }

  ngOnDestroy() {}

  get f() {
    return this.form.controls;
  }

  private get updateTeamInput(): UpdateTeamInput {
    return {
      name: this.f.name.value || undefined,
      description: this.f.description.value || undefined,
    };
  }

  private get newTeamInput(): NewTeamInput {
    return {
      name: this.f.name.value,
      description: this.f.description.value,
    };
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.status === 'INVALID') {
      return;
    }
    if (this.id) {
      this.loading = true;
      this.updateTeamGQL
        .mutate({ id: this.id, data: this.updateTeamInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.teamsService.applyFilters();
            this.modal.close('Team saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    } else {
      this.loading = true;
      this.createTeamGQL
        .mutate({ data: this.newTeamInput })
        .pipe(first())
        .subscribe({
          next: (data) => {
            this.modal.close('Team saved');
          },
          error: (error) => {
            this.error = error;
            this.loading = false;
          },
        });
    }
  }
}
