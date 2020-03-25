import {Component} from '@angular/core'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable} from 'rxjs'
import {User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {LWMActionType} from '../table-action-button/lwm-actions'
import {MatTableDataSource} from '@angular/material'

@Component({
    selector: 'lwm-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent {

    columns: TableHeaderColumn[]
    users$: Observable<User[]>

    private dataSource: MatTableDataSource<User>

    constructor(private readonly service: UserService) {
        this.columns = [
            {attr: 'lastname', title: 'Nachname'},
            {attr: 'firstname', title: 'Vorname'},
            {attr: 'systemId', title: 'GMID'},
            {attr: 'email', title: 'Email'}
        ]

        this.users$ = service.getAll()
    }

    initDataSource = (ds: MatTableDataSource<User>) =>
        this.dataSource = ds

    syncAction = (): LWMActionType[] => ['sync']

    onSync = () => console.log('sync...') // TODO
}
