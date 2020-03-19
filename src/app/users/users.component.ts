// import {Component, OnInit} from '@angular/core'
// import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
// import {User} from '../models/user.model'
// import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
// import {UserService} from '../services/user.service'
// import {MatDialog} from '@angular/material'
// import {AlertService} from '../services/alert.service'
// import {UserAuthorityUpdateDialogComponent} from './update/user-authority-update-dialog.component'
// import {NotImplementedError} from '../utils/functions'
//
// @Component({
//     selector: 'app-users',
//     templateUrl: '../abstract-crud/old-abstract-crud.component.html',
//     styleUrls: ['../abstract-crud/old-abstract-crud.component.scss']
// })
// export class UsersComponent extends AbstractCRUDComponent<User, User> implements OnInit {
//
//     static columns(): TableHeaderColumn[] {
//         return [
//             {attr: 'lastname', title: 'Nachname'},
//             {attr: 'firstname', title: 'Vorname'},
//             {attr: 'systemId', title: 'GMID'},
//             {attr: 'email', title: 'Email'}
//         ]
//     }
//
//     constructor(userService: UserService, dialog: MatDialog, alertService: AlertService) {
//         super(
//             () => userService,
//             dialog,
//             alertService,
//             UsersComponent.columns(),
//             ['update'],
//             'lastname',
//             'Nutzer',
//             'Nutzer',
//             _ => [],
//             model => model.lastname,
//             (model, attr) => model[attr],
//             () => ({lastname: '', firstname: '', systemId: '', email: '', id: ''}),
//             () => undefined
//         )
//     }
//
//     ngOnInit() {
//         super.ngOnInit()
//         this.fetchData()
//     }
//
//     onEdit = model => {
//         const dialogRef = UserAuthorityUpdateDialogComponent.instance(this.dialog, model)
//
//         this.subscribeAndPush(
//             dialogRef.afterClosed(),
//             console.log
//         )
//     }
//
//     create(output: FormOutputData[]): User {
//         return NotImplementedError()
//     }
//
//     update(model: User, updatedOutput: FormOutputData[]): User {
//         return NotImplementedError()
//     }
// }
