import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {FormInputData, FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {Validators} from '@angular/forms'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {BlacklistService} from '../services/blacklist.service'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {Time} from '../models/time.model'
import {localTimeValidator} from '../utils/form.validator'
import {NotImplementedError} from '../utils/functions'
import {withCreateProtocol} from '../models/protocol.model'
import {isUniqueEntity} from '../models/unique.entity.model'

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
                type: isModel ? 'text' : 'time',
                isDisabled: isModel,
                validator: isModel ? Validators.required : localTimeValidator(),
                value: isUniqueEntity(model) ? formatTime(model.start) : model.start
            },
            {
                formControlName: 'end',
                placeholder: 'Ende',
                type: isModel ? 'text' : 'time',
                isDisabled: isModel,
                validator: isModel ? Validators.required : localTimeValidator(),
                value: isUniqueEntity(model) ? formatTime(model.end) : model.end
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
            return formatTime(value)
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

    create(output: FormOutputData[]): BlacklistProtocol {
        return withCreateProtocol(output, BlacklistsComponent.empty(), p => {
            p.date = format(new Date(p.date), 'yyyy-MM-dd')
            p.start = formatTime(Time.fromTimeString(p.start))
            p.end = formatTime(Time.fromTimeString(p.end))
        })
    }

    update(model: Blacklist, updatedOutput: FormOutputData[]): BlacklistProtocol {
        return NotImplementedError()
    }
}
