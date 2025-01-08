import {Component} from '@angular/core'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable, Subscription} from 'rxjs'
import {Employee, Lecturer, StudentAtom, User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {isStudentAtom} from '../utils/type.check.utils'
import {UserSyncResult, UserSyncService} from '../services/user-sync.service'
import {AlertService} from '../services/alert.service'
import {MatTableDataSource} from '@angular/material/table'

type UserModel = StudentAtom | Employee | Lecturer

@Component({
    selector: 'lwm-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: false
})
export class UserComponent {

    users$: Observable<UserModel[]>
    dataSource: MatTableDataSource<UserModel>
    columns: TableHeaderColumn[]
    private subs: Subscription[]

    constructor(
        private readonly service: UserService,
        private readonly userSyncService: UserSyncService,
        private readonly alertService: AlertService
    ) {
        this.columns = [
            {attr: 'lastname', title: 'Nachname'},
            {attr: 'firstname', title: 'Vorname'},
            {attr: 'systemId', title: 'GMID'},
            {attr: 'email', title: 'Email'},
            {attr: 'enrollment', title: 'Studiengang'},
        ]
        this.users$ = service.getAllAtomic()
        this.subs = []
    }

    onEdit = (user: UserModel) =>
        this.subs.push(
            this.userSyncService.sync(user.id)
                .subscribe(this.onUpdateSuccess)
        )

    initDataSource = (ds: MatTableDataSource<UserModel>) =>
        this.dataSource = ds

    tableContent = (model: Readonly<User>, attr: string): string => {
        switch (attr) {
            case 'enrollment':
                return isStudentAtom(model) ? model.enrollment.label : ''
            default:
                return model[attr]
        }
    }

    onUpdateSuccess = (res: UserSyncResult) => {
        this.users$ = this.service.getAllAtomic()

        const html =
            '<p>sync successful</p>' +
            '<p>' +
            '<span>previous:</span>' +
            '<span>' + JSON.stringify(res.previous) + '</span>' +
            '</p > ' +
            '<p>' +
            '<span>updated:</span>' +
            '<span>' + JSON.stringify(res.updated) + '</span>' +
            '</p > '

        this.alertService.reportAlert({
            type: 'success',
            body: {
                kind: 'html',
                value: html
            }
        })
    }
}
