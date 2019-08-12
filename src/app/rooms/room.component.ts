import {Component} from '@angular/core'
import {MatDialog} from '@angular/material'
import {Room, RoomProtocol} from '../models/room.model'
import {AlertService} from '../services/alert.service'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Validators} from '@angular/forms'
import {FormInputData, FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {RoomService} from '../services/room.service'
import {createProtocol, withCreateProtocol} from '../models/protocol'

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

    static inputData(model: Readonly<RoomProtocol | Room>, isRoom: boolean): FormInputData[] {
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
            model => model.label,
            (model, attr) => model[attr],
            RoomComponent.empty,
            () => undefined
        )

        this.service = roomService // super.init does not allow types which are generic
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
