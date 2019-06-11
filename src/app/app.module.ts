import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { keycloakInitializer } from './security/keycloak.initializer';
import { RouteInterceptor } from './interceptors/route.interceptor';

import { EntryPageComponent } from './entry-page/entry-page.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';
import { EmployeeDashboardComponent } from './dashboard/employee-dashboard/employee-dashboard.component';

import { AppGuard } from './guards/app.guard';
import { DashboardGuard } from './guards/dashboard.guard';
import { StudentStatusGuard } from './guards/student-status.guard';
import { EmployeeStatusGuard } from './guards/employee-status.guard';

import { SessionService } from './services/session.service';


@NgModule({
  declarations: [
    AppComponent,
    StudentDashboardComponent,
    EmployeeDashboardComponent,
    EntryPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    KeycloakAngularModule
  ],
  providers: [
    AppGuard,
    DashboardGuard,
    StudentStatusGuard,
    EmployeeStatusGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakInitializer,
      multi: true,
      deps: [KeycloakService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: RouteInterceptor, multi: true },
    SessionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
