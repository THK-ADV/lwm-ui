import {Component} from '@angular/core'
import {FormGroup, ValidatorFn, Validators} from '@angular/forms'
import {MatDialog} from '@angular/material'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Semester, SemesterProtocol} from '../models/semester.model'
import {AlertService} from '../services/alert.service'
import {SemesterService} from '../services/semester.service'
import {FormInputData, FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {format} from '../utils/lwmdate-adapter'
import {createProtocol, withCreateProtocol} from '../models/protocol.model'


@Component({
    selector: 'app-semesters',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class SemestersComponent extends AbstractCRUDComponent<SemesterProtocol, Semester> {

    static empty(): SemesterProtocol {
        return {abbreviation: '', end: '', examStart: '', label: '', start: ''}
    }

    static columns(): TableHeaderColumn[] { // TODO unify columns, formControls and empty somehow
        return this.inputData(this.empty(), false).map(c => {
            return {attr: c.formControlName, title: c.placeholder}
        })
    }

    static inputData(model: Readonly<SemesterProtocol | Semester>, isModel: boolean): FormInputData[] {
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
                type: 'date',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.start
            },
            {
                formControlName: 'end',
                placeholder: 'Semesterende',
                type: 'date',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.end
            },
            {
                formControlName: 'examStart',
                placeholder: 'Beginn 1. Prüfungsphase',
                type: 'date',
                isDisabled: isModel,
                validator: Validators.required,
                value: model.examStart
            }
        ]
    }

    static startEndValidator(data: FormInputData[]): ValidatorFn | undefined {
        const start = data.find(d => d.formControlName === 'start')
        const end = data.find(d => d.formControlName === 'end')

        if (!(start && end)) {
            return undefined
        }

        return (group: FormGroup) => {
            const startControl = group.controls[start.formControlName]
            const endControl = group.controls[end.formControlName]

            if (startControl.value === '' || endControl.value === '') {
                return {}
            }

            if (startControl.value < endControl.value) {
                return {}
            }

            const error = {}
            error[start.formControlName] = `${start.placeholder} muss vor dem ${end.placeholder} liegen`
            startControl.setErrors(error)
            return error
        }
    }

    static prepareTableContent(semester: Readonly<Semester>, attr: string): string {
        const value = semester[attr]

        if (value instanceof Date) {
            return format(value, 'dd.MM.yyyy')
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
            SemestersComponent.prepareTableContent,
            SemestersComponent.empty,
            SemestersComponent.startEndValidator
        )

        this.service = semesterService // super.init does not allow types which are generic

    }

    create(output: FormOutputData[]): SemesterProtocol {
        return withCreateProtocol(output, SemestersComponent.empty(), p => {
            p.start = format(new Date(p.start), 'yyyy-MM-dd')
            p.end = format(new Date(p.end), 'yyyy-MM-dd')
            p.examStart = format(new Date(p.examStart), 'yyyy-MM-dd')
        })
    }

    update(model: Semester, updatedOutput: FormOutputData[]): SemesterProtocol {
        return withCreateProtocol(updatedOutput, SemestersComponent.empty(), p => {
            p.start = format(model.start, 'yyyy-MM-dd')
            p.end = format(model.end, 'yyyy-MM-dd')
            p.examStart = format(model.examStart, 'yyyy-MM-dd')
        })
    }
}
