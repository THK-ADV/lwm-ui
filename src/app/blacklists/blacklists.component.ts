import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {FormInputData, FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {Validators} from '@angular/forms'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {BlacklistService} from '../services/blacklist.service'
import {format} from '../utils/lwmdate-adapter'
import {Time} from '../models/time.model'
import {localTimeValidator} from '../utils/form.validator'

@Component({
    selector: 'app-blacklists',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class BlacklistsComponent extends AbstractCRUDComponent<BlacklistProtocol, Blacklist> {

    static columns(): TableHeaderColumn[] {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'global', title: 'Allgemeingültig'}
        ]
    }

    static inputData(model: Readonly<BlacklistProtocol | Blacklist>, isModel: boolean): FormInputData[] {
        return [
            {
                formControlName: 'label',
                placeholder: 'Bezeichnung',
                type: 'text',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.label
            },
            {
                formControlName: 'date',
                placeholder: 'Datum',
                type: 'date',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.date
            },
            {
                formControlName: 'start',
                placeholder: 'Start',
                type: 'time',
                isDisabled: isModel,
                validator: localTimeValidator(),
                value: model.start
            },
            {
                formControlName: 'end',
                placeholder: 'Ende',
                type: 'time',
                isDisabled: isModel,
                validator: localTimeValidator(),
                value: model.end
            },
            {
                formControlName: 'global',
                placeholder: 'Allgemeingültig',
                type: 'boolean',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.global
            }
        ]
    }

    static prepareTableContent(blacklist: Readonly<Blacklist>, attr: string): string {
        const value = blacklist[attr]

        if (value instanceof Date) {
            return format(value, 'dd.MM.yyyy')
        } else if (value instanceof Time) {
            return format(value.date, 'HH:mm:ss')
        } else {
            return value
        }
    }

    static empty(): BlacklistProtocol {
        return {label: '', date: '', start: '', end: '', global: false}
    }

    constructor(protected blacklistService: BlacklistService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            dialog,
            alertService,
            BlacklistsComponent.columns(),
            ['create', 'delete'],
            'label',
            'Blacklist',
            'Blacklists',
            BlacklistsComponent.inputData,
            model => model.label,
            BlacklistsComponent.prepareTableContent,
            BlacklistsComponent.empty,
            () => undefined
        )

        this.service = blacklistService // super.init does not allow types which are generic
    }

    // TODO maybe every instance should override this function without passing the protocol
    protected create(protocol: BlacklistProtocol, updatedValues: FormOutputData[]): BlacklistProtocol {
        return updatedValues.reduce(
            (json, data) => {
                switch (data.formControlName) {
                    case 'date':
                        json['date'] = format(data.value as Date, 'yyyy-MM-dd')
                        break
                    case 'start':
                        json['start'] = format((data.value as Time).date, 'HH:mm:ss')
                        break
                    case 'end':
                        json['end'] = format((data.value as Time).date, 'HH:mm:ss')
                        break
                    default:
                        json[data.formControlName] = data.value
                        break
                }

                return json
            }, BlacklistsComponent.empty()
        )
    }
}
