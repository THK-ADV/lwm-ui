import {Component, OnInit} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {BlacklistService} from '../services/blacklist.service'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {Time} from '../models/time.model'
import {NotImplementedError} from '../utils/functions'
import {withCreateProtocol} from '../models/protocol.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputDate} from '../shared-dialogs/forms/form.input.date'

@Component({
    selector: 'app-blacklists',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class BlacklistsComponent extends AbstractCRUDComponent<BlacklistProtocol, Blacklist> implements OnInit {

    static columns(): TableHeaderColumn[] {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'global', title: 'Allgemeingültig'}
        ]
    }

    static inputData(model: Readonly<BlacklistProtocol | Blacklist>, isModel: boolean): FormInput[] {
        return [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung',
                isDisabled: isModel,
                data: new FormInputString(model.label)
            },
            {
                formControlName: 'date',
                displayTitle: 'Datum',
                isDisabled: isModel,
                data: new FormInputDate(model.date)
            },
            // {
            //     formControlName: 'start',
            //     displayTitle: 'Start',
            //     isDisabled: true,
            //     data: new FormInputTime(Time.startOfTheDay())
            // },
            // {
            //     formControlName: 'end',
            //     displayTitle: 'Ende',
            //     isDisabled: true,
            //     data: new FormInputTime(Time.endOfTheDay())
            // },
            // {
            //     formControlName: 'global',
            //     displayTitle: 'Allgemeingültig',
            //     isDisabled: true,
            //     data: new FormInputBoolean(true)
            // }
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
            blacklistService,
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
    }

    ngOnInit() {
        super.ngOnInit()
        this.fetchBlacklists()
    }

    fetchBlacklists() {
        const blacklists$ = this.blacklistService.getAllWithFilter({attribute: 'global', value: 'true'})
        this.fetchData(blacklists$)
    }

    create(output: FormOutputData[]): BlacklistProtocol {
        return withCreateProtocol(output, BlacklistsComponent.empty(), p => {
            p.date = format(new Date(p.date), 'yyyy-MM-dd')

            // global blacklists only
            p.start = formatTime(Time.startOfTheDay())
            p.end = formatTime(Time.endOfTheDay())
            p.global = true
        })
    }

    update(model: Blacklist, updatedOutput: FormOutputData[]): BlacklistProtocol {
        return NotImplementedError()
    }
}
