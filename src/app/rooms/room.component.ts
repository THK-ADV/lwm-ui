import { Component } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Room, RoomProtocol } from '../models/room.model'
import { AlertService } from '../services/alert.service'
import { AbstractCRUDComponent, TableHeaderColumn } from '../abstract-crud/abstract-crud.component'
import { Validators } from '@angular/forms'
import { FormInputData } from '../shared-dialogs/create-update/create-update-dialog.component'
import { RoomService } from '../services/room.service'

@Component({
    selector: 'app-room',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class RoomComponent extends AbstractCRUDComponent<RoomProtocol, Room> {

    static columns(): TableHeaderColumn[] {
        return [
            { attr: 'label', title: 'Bezeichnung' },
            { attr: 'description', title: 'Beschreibung' },
            { attr: 'capacity', title: 'Kapazität' }
        ]
    }

    static inputData(model: RoomProtocol | Room, isRoom: boolean): FormInputData[] {
        return [
            {
                formControlName: 'label',
                placeholder: 'Bezeichnung',
                type: 'text',
                isDisabled: isRoom,
                validator: Validators.required,
                value: model.label
            },
            {
                formControlName: 'description',
                placeholder: 'Beschreibung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: model.description
            },
            {
                formControlName: 'capacity',
                placeholder: 'Kapazität',
                type: 'number',
                isDisabled: false,
                validator: [Validators.required, Validators.min(0)],
                value: model.capacity
            }
        ]
    }

    constructor(protected roomService: RoomService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            dialog,
            alertService,
            RoomComponent.columns(),
            ['create', 'update', 'delete'],
            'label',
            'Raum',
            'Räume',
            RoomComponent.inputData,
            model => model.label
        )

        this.service = roomService // super.init does not allow types which are generic
        this.empty = { label: '', description: '', capacity: 0 }
    }
}
