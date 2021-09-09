import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AssignmentsComponent } from './dashboard/assignments/assignments.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EntriesComponent } from './dashboard/entries/entries.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { TasksComponent } from './dashboard/tasks/tasks.component';
import { TeamModalComponent } from './dashboard/teams/team-modal/team-modal.component';
import { TeamsComponent } from './dashboard/teams/teams.component';
import { LoginComponent } from './login/login.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { GraphQLModule } from './_graphql/graphql.module';
import { appInitializer } from './_helpers/app.initializer';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
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
  ],
  imports: [
    BrowserModule,
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
