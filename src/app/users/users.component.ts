import { Component, OnInit } from '@angular/core';
import { AbstractCRUDComponent, TableHeaderColumn } from '../abstract-crud/abstract-crud.component';
import { User } from '../models/user.model';
import { FormInputData } from '../shared-dialogs/create-update/create-update-dialog.component';
import { Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material';
import { AlertService } from '../services/alert.service';
import { DegreeComponent } from '../degrees/degree.component';

@Component({
  selector: 'app-users',
  templateUrl: '../abstract-crud/abstract-crud.component.html',
  styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class UsersComponent extends AbstractCRUDComponent<User, User> {

  static columns(): TableHeaderColumn[] {
    return [
      { attr: 'lastname', title: 'Nachname' },
      { attr: 'firstname', title: 'Vorname' },
      { attr: 'systemId', title: 'GMID' },
      { attr: 'email', title: 'Email' }
    ]
  }

  static inputData(model: Readonly<User | User>, isModel: boolean): FormInputData[] {
    return [
      {
        formControlName: 'lastname',
        placeholder: 'Nachname',
        type: 'text',
        isDisabled: true,
        validator: Validators.required,
        value: model.lastname
      },
      {
        formControlName: 'firstname',
        placeholder: 'Vorname',
        type: 'text',
        isDisabled: true,
        validator: Validators.required,
        value: model.firstname
      },
      {
        formControlName: 'systemId',
        placeholder: 'GMID',
        type: 'text',
        isDisabled: true,
        validator: Validators.required,
        value: model.systemId
      },
      {
        formControlName: 'email',
        placeholder: 'Email',
        type: 'text',
        isDisabled: true,
        validator: Validators.required,
        value: model.email
      }
    ]
  }

  constructor(protected userService: UserService, protected dialog: MatDialog, protected alertService: AlertService) {
    super(
      dialog,
      alertService,
      UsersComponent.columns(),
      ['update'],
      'lastname',
      'Nutzer',
      'Nutzer',
      UsersComponent.inputData,
      model => model.lastname,
      (model, attr) => model[attr],
      () => ({ lastname: '', firstname: '', systemId: '', email: '', id: '' }),
      () => undefined
    )

    this.service = userService // super.init does not allow types which are generic
  }

}
