import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {Degree, DegreeProtocol} from '../models/degree.model'
import {DegreeService} from '../services/degree.service'
import {NotImplementedError} from '../utils/functions'
import {withCreateProtocol} from '../models/protocol.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'

@Component({
    selector: 'app-degree',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class DegreeComponent extends AbstractCRUDComponent<DegreeProtocol, Degree> {

    static columns(): TableHeaderColumn[] {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'abbreviation', title: 'Abkürzung'}
        ]
    }

    static empty(): DegreeProtocol {
        return {label: '', abbreviation: ''}
    }

    static inputData(model: Readonly<DegreeProtocol | Degree>, isModel: boolean): FormInput[] {
        return [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung',
                isDisabled: false,
                data: new FormInputString(model.label)
            },
            {
                formControlName: 'abbreviation',
                displayTitle: 'Abkürzung',
                isDisabled: isModel,
                data: new FormInputString(model.abbreviation)
            }
        ]
    }

    constructor(protected degreeService: DegreeService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            degreeService,
            dialog,
            alertService,
            DegreeComponent.columns(),
            ['update'],
            'label',
            'Studiengang',
            'Studiengänge',
            DegreeComponent.inputData,
            model => model.label,
            (model, attr) => model[attr],
            DegreeComponent.empty,
            () => undefined
        )
    }

    create(output: FormOutputData[]): DegreeProtocol {
        return NotImplementedError()
    }

    update(model: Degree, updatedOutput: FormOutputData[]): DegreeProtocol {
        return withCreateProtocol(updatedOutput, DegreeComponent.empty(), p => {
            p.label = model.label
        })
    }
}
