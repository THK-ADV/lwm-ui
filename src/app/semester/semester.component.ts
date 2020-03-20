import {Component, OnInit} from '@angular/core'
import {Semester, SemesterProtocol} from '../models/semester.model'
import {Observable} from 'rxjs'
import {SemesterService} from '../services/semester.service'
import {format} from '../utils/lwmdate-adapter'
import {Creatable, Deletable, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputDate} from '../shared-dialogs/forms/form.input.date'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormGroup, ValidatorFn} from '@angular/forms'
import {isUniqueEntity} from '../models/unique.entity.model'

@Component({
    selector: 'lwm-semester',
    templateUrl: './semester.component.html',
    styleUrls: ['./semester.component.scss']
})
export class SemesterComponent {

    columns: TableHeaderColumn[]
    tableContent: (model: Readonly<Semester>, attr: string) => string
    semesters$: Observable<Semester[]>
    creatable: Creatable<SemesterProtocol, Semester>
    deletable: Deletable<Semester>

    static startEndValidator = (data: FormInput[]): ValidatorFn | undefined => {
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
            error[start.formControlName] = `${start.displayTitle} muss vor dem ${end.displayTitle} liegen`
            startControl.setErrors(error)
            return error
        }
    }

    constructor(private readonly service: SemesterService) {
        this.columns = [
            {title: 'Bezeichnung', attr: 'label'},
            {title: 'Abkürzung', attr: 'abbreviation'},
            {title: 'Semesterstart', attr: 'start'},
            {title: 'Semesterende', attr: 'end'},
            {title: 'Beginn 1. Prüfungsphase', attr: 'examStart'}
        ]
        this.tableContent = (s, attr) => {
            switch (attr) {
                case 'start':
                    return format(s.start, 'dd.MM.yyyy')
                case 'end':
                    return format(s.end, 'dd.MM.yyyy')
                case 'examStart':
                    return format(s.examStart, 'dd.MM.yyyy')

                default:
                    return s[attr]
            }
        }
        this.semesters$ = service.getAll()
        this.creatable = {
            dialogTitle: 'Semester',
            emptyProtocol: () => ({abbreviation: '', end: '', examStart: '', label: '', start: ''}),
            makeInput: (attr, e) => {
                switch (attr) {
                    case 'label':
                        return {isDisabled: false, data: new FormInputString(e.label)}
                    case 'abbreviation':
                        return {isDisabled: false, data: new FormInputString(e.abbreviation)}
                    case 'start':
                        return {isDisabled: isUniqueEntity(e), data: new FormInputDate(e.start)}
                    case 'end':
                        return {isDisabled: isUniqueEntity(e), data: new FormInputDate(e.end)}
                    case 'examStart':
                        return {isDisabled: isUniqueEntity(e), data: new FormInputDate(e.examStart)}
                }
            },
            commitProtocol: (p, s) => {
                const start = s?.start ?? new Date(p.start)
                const end = s?.end ?? new Date(p.end)
                const examStart = s?.examStart ?? new Date(p.examStart)

                return {
                    ...p,
                    start: format(start, 'yyyy-MM-dd'),
                    end: format(end, 'yyyy-MM-dd'),
                    examStart: format(examStart, 'yyyy-MM-dd')
                }
            },
            create: service.create,
            update: service.update,
            compoundFromGroupValidator: SemesterComponent.startEndValidator
        }
        this.deletable = {
            titleForDialog: _ => _.label,
            delete: service.delete
        }
    }
}
