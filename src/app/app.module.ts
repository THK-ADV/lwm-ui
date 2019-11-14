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
import {AbstractHeaderComponent} from './abstract-header/abstract-header.component'
import {GroupsComponent} from './groups/groups.component'
import {GroupEditComponent} from './groups/edit/group-edit.component'
import {CourseDetailComponent} from './course-detail/course-detail.component'
import {CourseAuthorityUpdateDialogComponent} from './course-authority-dialog/course-authority-dialog.component'
import {LabworkChainComponent} from './labwork-chain/labwork-chain.component'
import {AssignmentPlanComponent} from './labwork-chain/assignment-plan/view/assignment-plan.component'
import {FullCalendarModule} from '@fullcalendar/angular'
import {TimetableEditComponent} from './labwork-chain/timetable/edit/timetable-edit.component'
import {TimetableEntryComponent} from './labwork-chain/timetable/entry/timetable-entry.component'
import {TimetableBlacklistsEditComponent} from './labwork-chain/timetable-blacklists/edit/timetable-blacklists-edit.component'
import {TableActionButtonComponent} from './table-action-button/table-action-button.component'
import {ScheduleComponent} from './labwork-chain/schedule/view/schedule.component'
import {GroupPreviewComponent} from './labwork-chain/group/preview/group-preview.component'
import {CardListComponent} from './card-list/card-list.component'
import {ReportCardsComponent} from './labwork-chain/report-cards/create/report-cards.component'
import {AbstractGroupViewComponent} from './labwork-chain/abstract-group-view/abstract-group-view.component'
import {GroupPreviewModalComponent} from './labwork-chain/group/preview/group-preview-modal/group-preview-modal.component'
import {GroupImmutableComponent} from './labwork-chain/group/list/group-immutable.component'
import {AbstractScheduleViewComponent} from './labwork-chain/abstract-schedule-view/abstract-schedule-view.component'
import {SchedulePreviewComponent} from './labwork-chain/schedule/preview/schedule-preview.component'
import {ConfirmDialogComponent} from './shared-dialogs/confirm-dialog/confirm-dialog.component'
import {AbstractAssignmentPlanViewComponent} from './labwork-chain/abstract-assignment-plan-view/abstract-assignment-plan-view.component'
import {AssignmentPlanEditComponent} from './labwork-chain/assignment-plan/edit/assignment-plan-edit.component'
import {AbstractTimetableViewComponent} from './labwork-chain/abstract-timetable-view/abstract-timetable-view.component'
import {TimetableViewComponent} from './labwork-chain/timetable/view/timetable-view.component'
import {AbstractBlacklistTimetableViewComponent} from './labwork-chain/abstract-blacklist-timetable-view/abstract-blacklist-timetable-view.component'
import {TimetableBlacklistViewComponent} from './labwork-chain/timetable-blacklists/view/timetable-blacklist-view.component'
import {AbstractClosingViewComponent} from './labwork-chain/abstract-closing-view/abstract-closing-view.component'
import {ClosingComponent} from './labwork-chain/report-cards/closing/closing.component'
import {UserAuthorityResolver} from './security/user-authority-resolver'
import {ProgressBarComponent} from './progress-bar/progress-bar.component'
import {DecisionDialogComponent} from './shared-dialogs/decision-dialog/decision-dialog.component'
import {AssignmentEntryTakeoverDialogComponent} from './labwork-chain/assignment-plan/takeover-dialog/assignment-entry-takeover-dialog.component'

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
        AbstractHeaderComponent,
        GroupsComponent,
        GroupEditComponent,
        CourseDetailComponent,
        CourseAuthorityUpdateDialogComponent,
        LabworkChainComponent,
        AssignmentPlanComponent,
        TimetableEditComponent,
        TimetableEntryComponent,
        TimetableBlacklistsEditComponent,
        TableActionButtonComponent,
        ScheduleComponent,
        GroupPreviewComponent,
        CardListComponent,
        ReportCardsComponent,
        AbstractGroupViewComponent,
        GroupPreviewModalComponent,
        GroupImmutableComponent,
        AbstractScheduleViewComponent,
        SchedulePreviewComponent,
        ConfirmDialogComponent,
        AbstractAssignmentPlanViewComponent,
        AssignmentPlanEditComponent,
        AbstractTimetableViewComponent,
        TimetableViewComponent,
        AbstractBlacklistTimetableViewComponent,
        TimetableBlacklistViewComponent,
        AbstractClosingViewComponent,
        ClosingComponent,
        ProgressBarComponent,
        DecisionDialogComponent,
        AssignmentEntryTakeoverDialogComponent
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
        UserAuthorityResolver,
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
        TimetableEntryComponent,
        GroupPreviewModalComponent,
        ConfirmDialogComponent,
        DecisionDialogComponent,
        AssignmentEntryTakeoverDialogComponent
    ]
})
export class AppModule {
}
