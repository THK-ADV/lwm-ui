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
import {StudentsComponent} from './students/students.component'
import {SemesterComponent} from './semester/semester.component'
import {RoomComponent} from './room/room.component'
import {UserComponent} from './user/user.component'
import {CourseComponent} from './course/course.component'
import {DegreeComponent} from './degree/degree.component'
import {BlacklistComponent} from './blacklist/blacklist.component'
import {LabworkApplicationComponent} from './labwork-application/labwork-application.component'

const routes: Routes = [
    {
        path: 's',
        component: StudentDashboardComponent,
        canActivate: [StudentStatusGuard],
        children: []
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
                path: 'students/:sid',
                resolve: {userAuths: UserAuthorityResolver},
                component: StudentsComponent
            },
            {
                path: '',
                component: EmployeeDashboardComponent
            },
            {
                path: 'courses/:cid',
                resolve: {userAuths: UserAuthorityResolver},
                children: [
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
                        component: LabworksComponent
                    }
                ]
            }
        ]
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
