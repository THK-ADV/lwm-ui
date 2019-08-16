import {Component} from '@angular/core'
import {MatDialog} from '@angular/material'
import {Room, RoomProtocol} from '../models/room.model'
import {AlertService} from '../services/alert.service'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {RoomService} from '../services/room.service'
import {createProtocol, withCreateProtocol} from '../models/protocol.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputNumber} from '../shared-dialogs/forms/form.input.number'

@Component({
    selector: 'app-room',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class RoomComponent extends AbstractCRUDComponent<RoomProtocol, Room> {

    static columns(): TableHeaderColumn[] {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'description', title: 'Beschreibung'},
            {attr: 'capacity', title: 'Kapazität'}
        ]
    }

    static empty(): RoomProtocol {
        return {label: '', description: '', capacity: 0}
    }

    static inputData(model: Readonly<RoomProtocol | Room>, isRoom: boolean): FormInput[] {
        return [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung',
                isDisabled: isRoom,
                data: new FormInputString(model.label)
            },
            {
                formControlName: 'description',
                displayTitle: 'Beschreibung',
                isDisabled: false,
                data: new FormInputString(model.description)
            },
            {
                formControlName: 'capacity',
                displayTitle: 'Kapazität',
                isDisabled: false,
                data: new FormInputNumber(model.capacity)
            }
        ]
    }

    constructor(protected roomService: RoomService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            roomService,
            dialog,
            alertService,
            RoomComponent.columns(),
            ['create', 'update', 'delete'],
            'label',
            'Raum',
            'Räume',
            RoomComponent.inputData,
            model => model.label,
            (model, attr) => model[attr],
            RoomComponent.empty,
            () => undefined
        )
    }

    create(output: FormOutputData[]): RoomProtocol {
        return createProtocol(output, RoomComponent.empty())
    }

    update(model: Room, updatedOutput: FormOutputData[]): RoomProtocol {
        return withCreateProtocol(updatedOutput, RoomComponent.empty(), p => {
            p.label = model.label
        })
    }
}
