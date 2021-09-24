import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './dashboard/admin/access/access.component';
import { AssignmentsComponent } from './dashboard/assignments/assignments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntriesComponent } from './dashboard/entries/entries.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { TaskDetailsComponent } from './dashboard/tasks/task-details/task-details.component';
import { TasksComponent } from './dashboard/tasks/tasks.component';
import { TeamsComponent } from './dashboard/teams/teams.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AdminGuard } from './_helpers/admin.guard';
import { AuthGuard } from './_helpers/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'assignments' },
      { path: 'assignments', component: AssignmentsComponent },
      {
        path: 'tasks',
        component: TasksComponent,
      },
      { path: 'tasks/:id', component: TaskDetailsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'teams', component: TeamsComponent },
      { path: 'entries', component: EntriesComponent },
      {
        path: 'access',
        canActivate: [AdminGuard],
        component: AccessComponent,
      },
    ],
  },

  // otherwise redirect to home
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
