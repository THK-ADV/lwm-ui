import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {FormInputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {Validators} from '@angular/forms'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {Degree, DegreeProtocol} from '../models/degree.model'
import {DegreeService} from '../services/degree.service'

@Component({
    selector: 'app-degree',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class DegreeComponent extends AbstractCRUDComponent<DegreeProtocol, Degree> {

    static columns(): TableHeaderColumn[] { // TODO unify columns, formControls and empty somehow
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'abbreviation', title: 'Abkürzung'}
        ]
    }

    static inputData(model: Readonly<DegreeProtocol | Degree>, isModel: boolean): FormInputData[] {
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
                formControlName: 'abbreviation',
                placeholder: 'Abkürzung',
                type: 'text',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.abbreviation
            }
        ]
    }

    constructor(protected degreeService: DegreeService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
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
            () => ({label: '', abbreviation: ''}),
            () => undefined
        )

        this.service = degreeService // super.init does not allow types which are generic
    }
}
