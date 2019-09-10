import {BrowserModule} from '@angular/platform-browser'
import {APP_INITIALIZER, NgModule} from '@angular/core'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'

import {AppRoutingModule} from './app-routing.module'
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http'

import {AppComponent} from './app.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'

import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular'
import {keycloakInitializer} from './security/keycloak.initializer'
import {RouteInterceptor} from './interceptors/route.interceptor'

import {EntryPageComponent} from './entry-page/entry-page.component'
import {StudentDashboardComponent} from './dashboard/student-dashboard/student-dashboard.component'
import {EmployeeDashboardComponent} from './dashboard/employee-dashboard/employee-dashboard.component'

import {AppGuard} from './guards/app.guard'
import {DashboardGuard} from './guards/dashboard.guard'
import {StudentStatusGuard} from './guards/student-status.guard'
import {EmployeeStatusGuard} from './guards/employee-status.guard'

import {NavComponent} from './nav/nav.component'
import {LWMMaterialModule} from './app.material.module'
import {CoursesComponent} from './courses/courses.component'
import {RoomComponent} from './rooms/room.component'
import {DeleteDialogComponent} from './shared-dialogs/delete/delete-dialog.component'
import {CreateUpdateDialogComponent} from './shared-dialogs/create-update/create-update-dialog.component'
import {ListTemplateComponent} from './list-template/list-template.component'
import {AlertComponent} from './alert/alert.component'
import {DegreeComponent} from './degrees/degree.component'
import {SemestersComponent} from './semesters/semesters.component'
import {UsersComponent} from './users/users.component'
import {UserAuthorityUpdateDialogComponent} from './users/update/user-authority-update-dialog.component'
import {BlacklistsComponent} from './blacklists/blacklists.component'
import {LabworksComponent} from './labworks/labworks.component'
import {FilterPipe} from './pipe/filter.pipe'
import {NgInitDirective} from './directives/ng-init.directive'
import {LabworkApplicationsComponent} from './labwork-applications/labwork-applications.component'
import {CreateHeaderComponent} from './editable-header/create-header.component'
import {GroupsComponent} from './groups/groups.component'
import {GroupEditComponent} from './groups/edit/group-edit.component'
import {CourseDetailComponent} from './course-detail/course-detail.component'
import {CourseAuthorityUpdateDialogComponent} from './course-authority-dialog/course-authority-dialog.component'
import {LabworkChainComponent} from './labwork-chain/labwork-chain.component'
import {AssignmentPlanComponent} from './labwork-chain/assignment-plan/assignment-plan.component'
import {FullCalendarModule} from '@fullcalendar/angular'
import {TimetableComponent} from './labwork-chain/timetable/timetable.component'
import {TimetableEntryComponent} from './labwork-chain/timetable/timetable-entry/timetable-entry.component'
import {TimetableBlacklistsComponent} from './labwork-chain/timetable-blacklists/timetable-blacklists.component'
import {TableActionButtonComponent} from './table-action-button/table-action-button.component'
import {ScheduleComponent} from './labwork-chain/schedule/schedule.component'
import {GroupPreviewComponent} from './labwork-chain/group-preview/group-preview.component'
import {CardListComponent} from './card-list/card-list.component'
import {ClosingComponent} from './labwork-chain/closing/closing.component'

@NgModule({
    declarations: [
        AppComponent,
        StudentDashboardComponent,
        EmployeeDashboardComponent,
        EntryPageComponent,
        NavComponent,
        CoursesComponent,
        RoomComponent,
        DeleteDialogComponent,
        CreateUpdateDialogComponent,
        ListTemplateComponent,
        AlertComponent,
        DegreeComponent,
        SemestersComponent,
        BlacklistsComponent,
        UsersComponent,
        UserAuthorityUpdateDialogComponent,
        LabworksComponent,
        FilterPipe,
        NgInitDirective,
        LabworkApplicationsComponent,
        CreateHeaderComponent,
        GroupsComponent,
        GroupEditComponent,
        CourseDetailComponent,
        CourseAuthorityUpdateDialogComponent,
        LabworkChainComponent,
        AssignmentPlanComponent,
        TimetableComponent,
        TimetableEntryComponent,
        TimetableBlacklistsComponent,
        TableActionButtonComponent,
        ScheduleComponent,
        GroupPreviewComponent,
        CardListComponent,
        ClosingComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NgbModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        LWMMaterialModule,
        KeycloakAngularModule,
        FullCalendarModule
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
        {provide: HTTP_INTERCEPTORS, useClass: RouteInterceptor, multi: true}
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        DeleteDialogComponent,
        CreateUpdateDialogComponent,
        UserAuthorityUpdateDialogComponent,
        GroupEditComponent,
        CourseDetailComponent,
        CourseAuthorityUpdateDialogComponent,
        TimetableEntryComponent
    ]
})
export class AppModule {
}
