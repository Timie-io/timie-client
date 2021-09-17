import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AssignmentsComponent } from './dashboard/assignments/assignments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntriesComponent } from './dashboard/entries/entries.component';
import { ProjectModalComponent } from './dashboard/projects/project-modal/project-modal.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { TaskPriorityDirective } from './dashboard/tasks/directives/priority.directive';
import { TaskDetailsComponent } from './dashboard/tasks/task-details/task-details.component';
import { TaskModalComponent } from './dashboard/tasks/task-modal/task-modal.component';
import { TasksComponent } from './dashboard/tasks/tasks.component';
import { TeamMembersComponent } from './dashboard/teams/team-members/team-members.component';
import { TeamModalComponent } from './dashboard/teams/team-modal/team-modal.component';
import { TeamsComponent } from './dashboard/teams/teams.component';
import { LoginComponent } from './login/login.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { ActiveDirective } from './_directives/active.directive';
import { GraphQLModule } from './_graphql/graphql.module';
import { appInitializer } from './_helpers/app.initializer';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { AuthService } from './_services/auth.service';
import { TaskFollowersComponent } from './dashboard/tasks/task-followers/task-followers.component';
import { TaskAssignmentsComponent } from './dashboard/tasks/task-assignments/task-assignments.component';
import { TaskCommentsComponent } from './dashboard/tasks/task-comments/task-comments.component';

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
