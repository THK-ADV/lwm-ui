import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {EmployeeDashboardComponent} from './dashboard/employee-dashboard/employee-dashboard.component'
import {StudentDashboardComponent} from './dashboard/student-dashboard/student-dashboard.component'
import {EntryPageComponent} from './entry-page/entry-page.component'
import {DashboardGuard} from './guards/dashboard.guard'
import {EmployeeStatusGuard} from './guards/employee-status.guard'
import {StudentStatusGuard} from './guards/student-status.guard'
import {LabworksComponent} from './labworks/labworks.component'
import {GroupsComponent} from './groups/groups.component'
import {LabworkChainComponent} from './labwork-chain/labwork-chain.component'
import {UserAuthorityResolver} from './security/user-authority-resolver'
import {SemesterComponent} from './semester/semester.component'
import {RoomComponent} from './room/room.component'
import {UserComponent} from './user/user.component'
import {CourseComponent} from './course/course.component'
import {DegreeComponent} from './degree/degree.component'
import {BlacklistComponent} from './blacklist/blacklist.component'
import {LabworkApplicationComponent} from './labwork-application/labwork-application.component'
import {ScheduleEntryComponent} from './schedule-entry/schedule-entry.component'
import {StudentReportCardComponent} from './dashboard/student-dashboard/student-reportcard/student-report-card.component'
import {ReportCardEvaluationComponent} from './report-card-evaluation/report-card-evaluation.component'
import {CourseLabworkParamResolver} from './resolver/course-labwork-param-resolver'
import {ReportCardEntryTypeBatchUpdateComponent} from './report-card-entry-type-batch-update/report-card-entry-type-batch-update.component'
import {StudentSearchComponent} from './student-search/student-search.component'

const routes: Routes = [
    {
        path: 's',
        canActivate: [StudentStatusGuard],
        children: [
            {
                path: 'reportCards/labworks/:lid/student-search/:sid',
                component: StudentReportCardComponent
            },
            {
                path: 'courses/:cid/scheduleEntries/:sid',
                resolve: {userAuths: UserAuthorityResolver},
                component: ScheduleEntryComponent
            },
            {
                path: '',
                component: StudentDashboardComponent,
            }
        ]
    },
    {
        path: 'e',
        canActivate: [EmployeeStatusGuard],
        children: [
            {
                path: 'authorities',
                component: UserComponent
            },
            {
                path: 'modules',
                component: CourseComponent
            },
            {
                path: 'rooms',
                component: RoomComponent
            },
            {
                path: 'degrees',
                component: DegreeComponent
            },
            {
                path: 'semesters',
                component: SemesterComponent
            },
            {
                path: 'blacklists',
                component: BlacklistComponent
            },
            {
                path: '',
                component: EmployeeDashboardComponent
            },
            {
                path: 'courses/:cid',
                children: [
                    {
                        path: 'scheduleEntries/:sid',
                        resolve: {userAuths: UserAuthorityResolver},
                        component: ScheduleEntryComponent
                    },
                    {
                        path: 'labworks/:lid/applications',
                        resolve: {userAuths: UserAuthorityResolver},
                        component: LabworkApplicationComponent
                    },
                    {
                        path: 'labworks/:lid/groups',
                        resolve: {userAuths: UserAuthorityResolver},
                        component: GroupsComponent
                    },
                    {
                        path: 'labworks/:lid/graduates',
                        resolve: {userAuths: UserAuthorityResolver, params: CourseLabworkParamResolver},
                        component: ReportCardEvaluationComponent
                    },
                    {
                        path: 'labworks/:lid/reportCardEntryType',
                        resolve: {userAuths: UserAuthorityResolver, params: CourseLabworkParamResolver},
                        component: ReportCardEntryTypeBatchUpdateComponent
                    },
                    {
                        path: 'labworks/:lid/chain',
                        resolve: {userAuths: UserAuthorityResolver},
                        children: [
                            {
                                path: '',
                                component: LabworkChainComponent
                            }
                        ]
                    },
                    {
                        path: '',
                        resolve: {userAuths: UserAuthorityResolver},
                        component: LabworksComponent
                    }
                ]
            }
        ]
    },
    {
        path: 'students/:sid',
        resolve: {userAuths: UserAuthorityResolver},
        component: StudentSearchComponent
    },
    {
        path: '',
        component: EntryPageComponent,
        canActivate: [DashboardGuard]
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
