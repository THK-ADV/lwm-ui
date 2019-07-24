import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {FormInputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {Validators} from '@angular/forms'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {SemesterService} from '../services/semester.service'

@Component({
    selector: 'app-semesters',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class SemestersComponent extends AbstractCRUDComponent<SemesterProtocol, Semester> {

    static empty(): SemesterProtocol {
        return {abbreviation: '', end: '', examStart: '', label: '', start: ''}
        // return this.columns().reduce<{}>(((initial, acc) => {
        //     initial[acc.attr] = ''
        //     return initial
        // }), {}) as SemesterProtocol
    }

    static columns(): TableHeaderColumn[] { // TODO unify columns, formControls and empty somehow
        return this.inputData(this.empty(), false).map(c => {
            return {attr: c.formControlName, title: c.placeholder}
        })
    }

    static inputData(model: SemesterProtocol | Semester, isModel: boolean): FormInputData[] {
        return [
            {
                formControlName: 'label',
                placeholder: 'Bezeichnung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: model.label
            },
            {
                formControlName: 'abbreviation',
                placeholder: 'Abkürzung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: model.abbreviation
            },
            {
                formControlName: 'start',
                placeholder: 'Semesterstart',
                type: 'text',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.start
            },
            {
                formControlName: 'end',
                placeholder: 'Semesterende',
                type: 'text',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.end
            },
            {
                formControlName: 'examStart',
                placeholder: 'Beginn 1. Prüfungsphase',
                type: 'text',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.examStart
            }
        ]
    }

    static prepareTableContent(semester: Semester, attr: string): string {
        const value = semester[attr]

        if (value instanceof Date) {
            return value.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: '2-digit'})
        } else {
            return value
        }
    }

    constructor(protected semesterService: SemesterService, protected dialog: MatDialog, protected alertService: AlertService) {
        super(
            dialog,
            alertService,
            SemestersComponent.columns(),
            ['create', 'update'],
            'label',
            'Semester',
            'Semester',
            SemestersComponent.inputData,
            model => model.label,
            SemestersComponent.prepareTableContent
        )

        this.service = semesterService // super.init does not allow types which are generic
        this.empty = SemestersComponent.empty()
    }

}
