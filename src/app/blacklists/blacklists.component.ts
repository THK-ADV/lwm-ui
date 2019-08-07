import { Component } from '@angular/core';
import { AbstractCRUDComponent, TableHeaderColumn } from '../abstract-crud/abstract-crud.component';
import { Blacklist, BlacklistProtocol } from '../models/blacklist.model';
import { FormInputData } from '../shared-dialogs/create-update/create-update-dialog.component';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AlertService } from '../services/alert.service';
import { BlacklistService } from '../services/blacklist.service';
import { format } from '../utils/lwmdate-adapter';

@Component({
  selector: 'app-blacklists',
  templateUrl: '../abstract-crud/abstract-crud.component.html',
  styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class BlacklistsComponent extends AbstractCRUDComponent<BlacklistProtocol, Blacklist> {

  static columns(): TableHeaderColumn[] {
    return [
      { attr: 'label', title: 'Bezeichnung' },
      { attr: 'dates', title: 'Datum' }
    ]
  }

  static inputData(model: Readonly<BlacklistProtocol | Blacklist>, isBlacklist: boolean): FormInputData[] {
    return [
        {
            formControlName: 'label',
            placeholder: 'Bezeichnung',
            type: 'text',
            isDisabled: true,
            validator: Validators.required,
            value: model.label
        },
        {
            formControlName: 'date',
            placeholder: 'Datum',
            type: 'date',
            isDisabled: true,
            validator: Validators.required,
            value: model.date
        },
        {
            formControlName: 'start',
            placeholder: 'Start',
            type: 'date',
            isDisabled: false,
            validator: Validators.required,
            value: model.start
        },
        {
            formControlName: 'end',
            placeholder: 'Ende',
            type: 'date',
            isDisabled: false,
            validator: Validators.required,
            value: model.end
        },
        {
            formControlName: 'global',
            placeholder: 'Allgemeingültig',
            type: 'text',
            isDisabled: true,
            validator: Validators.required,
            value: model.global
        }
    ]
}

static prepareTableContent(blacklist: Readonly<Blacklist>, attr: string): string {
  const value = blacklist[attr]

  if (value instanceof Date) {
      return format(value, 'dd.MM.yy')
  } else {
      return value
  }
}

constructor(protected blacklistService: BlacklistService, protected dialog: MatDialog, protected alertService: AlertService) {
  super(
      dialog,
      alertService,
      BlacklistsComponent.columns(),
      ['create', 'update', 'delete'],
      'label',
      'Raum',
      'Räume',
      BlacklistsComponent.inputData,
      model => model.label,
      (model, attr) => model[attr],
      () => ({label: '', date: '', start: '', end: '', global: false}),
      () => undefined
  )

  this.service = blacklistService // super.init does not allow types which are generic
}

  ngOnInit() {
  }

}
