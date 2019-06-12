import {NgModule} from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import {StudentDashboardComponent} from './dashboard/student-dashboard/student-dashboard.component'
import {StudentStatusGuard} from './guards/student-status.guard'
import {EmployeeDashboardComponent} from './dashboard/employee-dashboard/employee-dashboard.component'
import {EmployeeStatusGuard} from './guards/employee-status.guard'
import {EntryPageComponent} from './entry-page/entry-page.component'
import {DashboardGuard} from './guards/dashboard.guard'
import {CoursesComponent} from './courses/courses.component'

const routes: Routes = [
    {
        path: 's',
        component: StudentDashboardComponent,
        canActivate: [StudentStatusGuard],
        children: []
    },
    {
        path: 'e',
        component: EmployeeDashboardComponent,
        canActivate: [EmployeeStatusGuard],
        children: []
    },
    {
        path: '',
        component: EntryPageComponent,
        canActivate: [DashboardGuard]
    },
    {
        path: 'courses/:id',
        component: CoursesComponent
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
