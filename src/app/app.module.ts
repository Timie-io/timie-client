import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccessComponent } from './dashboard/admin/access/access.component';
import { AssignmentsComponent } from './dashboard/assignments/assignments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntriesComponent } from './dashboard/entries/entries.component';
import { EntryModalComponent } from './dashboard/entries/entry-modal/entry-modal.component';
import { ProjectModalComponent } from './dashboard/projects/project-modal/project-modal.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { TaskPriorityDirective } from './dashboard/tasks/directives/priority.directive';
import { TaskAssignmentModalComponent } from './dashboard/tasks/task-assignments/task-assignment-modal/task-assignment-modal.component';
import { TaskAssignmentsComponent } from './dashboard/tasks/task-assignments/task-assignments.component';
import { TaskCommentsComponent } from './dashboard/tasks/task-comments/task-comments.component';
import { TaskDetailsComponent } from './dashboard/tasks/task-details/task-details.component';
import { TaskFollowersComponent } from './dashboard/tasks/task-followers/task-followers.component';
import { TaskModalComponent } from './dashboard/tasks/task-modal/task-modal.component';
import { TasksComponent } from './dashboard/tasks/tasks.component';
import { TeamMembersComponent } from './dashboard/teams/team-members/team-members.component';
import { TeamModalComponent } from './dashboard/teams/team-modal/team-modal.component';
import { TeamsComponent } from './dashboard/teams/teams.component';
import { LoginComponent } from './login/login.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileModalComponent } from './top-menu/profile-modal/profile-modal.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { ActiveDirective } from './_directives/active.directive';
import { SortingDirective } from './_directives/sorting.directive';
import { GraphQLModule } from './_graphql/graphql.module';
import { appInitializer } from './_helpers/app.initializer';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { FormatDurationPipe } from './_pipes/format-duration.pipe';
import { AuthService } from './_services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    TopMenuComponent,
    SideMenuComponent,
    AssignmentsComponent,
    TasksComponent,
    ProjectsComponent,
    TeamsComponent,
    EntriesComponent,
    TeamModalComponent,
    TeamMembersComponent,
    ProjectModalComponent,
    TaskModalComponent,
    TaskDetailsComponent,
    TaskPriorityDirective,
    ActiveDirective,
    TaskFollowersComponent,
    TaskAssignmentsComponent,
    TaskCommentsComponent,
    TaskAssignmentModalComponent,
    FormatDurationPipe,
    EntryModalComponent,
    AccessComponent,
    SignupComponent,
    ProfileModalComponent,
    SortingDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    NgbModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
