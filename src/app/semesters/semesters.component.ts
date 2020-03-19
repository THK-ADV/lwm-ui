// import {Component, OnInit} from '@angular/core'
// import {FormGroup, ValidatorFn} from '@angular/forms'
// import {MatDialog} from '@angular/material'
// import {OldAbstractCrudComponent, TableHeaderColumn} from '../abstract-crud/old/old-abstract-crud.component'
// import {Semester, SemesterProtocol} from '../models/semester.model'
// import {AlertService} from '../services/alert.service'
// import {SemesterService} from '../services/semester.service'
// import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
// import {format} from '../utils/lwmdate-adapter'
// import {withCreateProtocol} from '../models/protocol.model'
// import {FormInput} from '../shared-dialogs/forms/form.input'
// import {FormInputString} from '../shared-dialogs/forms/form.input.string'
// import {FormInputDate} from '../shared-dialogs/forms/form.input.date'
//
//
// @Component({
//     selector: 'app-semesters',
//     templateUrl: '../abstract-crud/old/old-abstract-crud.component.html',
//     styleUrls: ['../abstract-crud/old/old-abstract-crud.component.scss']
// })
// export class SemestersComponent extends OldAbstractCrudComponent<SemesterProtocol, Semester> implements OnInit {
//
//     static empty(): SemesterProtocol {
//         return {abbreviation: '', end: '', examStart: '', label: '', start: ''}
//     }
//
//     static columns(): TableHeaderColumn[] { // TODO unify columns, formControls and empty somehow
//         return this.inputData(this.empty(), false).map(c => {
//             return {attr: c.formControlName, title: c.displayTitle}
//         })
//     }
//
//     static inputData(model: Readonly<SemesterProtocol | Semester>, isModel: boolean): FormInput[] {
//         return [
//             {
//                 formControlName: 'label',
//                 displayTitle: 'Bezeichnung',
//                 isDisabled: false,
//                 data: new FormInputString(model.label)
//             },
//             {
//                 formControlName: 'abbreviation',
//                 displayTitle: 'Abkürzung',
//                 isDisabled: false,
//                 data: new FormInputString(model.abbreviation)
//             },
//             {
//                 formControlName: 'start',
//                 displayTitle: 'Semesterstart',
//                 isDisabled: isModel,
//                 data: new FormInputDate(model.start)
//             },
//             {
//                 formControlName: 'end',
//                 displayTitle: 'Semesterende',
//                 isDisabled: isModel,
//                 data: new FormInputDate(model.end)
//             },
//             {
//                 formControlName: 'examStart',
//                 displayTitle: 'Beginn 1. Prüfungsphase',
//                 isDisabled: isModel,
//                 data: new FormInputDate(model.examStart)
//             }
//         ]
//     }
//
//     static startEndValidator(data: FormInput[]): ValidatorFn | undefined {
//         const start = data.find(d => d.formControlName === 'start')
//         const end = data.find(d => d.formControlName === 'end')
//
//         if (!(start && end)) {
//             return undefined
//         }
//
//         return (group: FormGroup) => {
//             const startControl = group.controls[start.formControlName]
//             const endControl = group.controls[end.formControlName]
//
//             if (startControl.value === '' || endControl.value === '') {
//                 return {}
//             }
//
//             if (startControl.value < endControl.value) {
//                 return {}
//             }
//
//             const error = {}
//             error[start.formControlName] = `${start.displayTitle} muss vor dem ${end.displayTitle} liegen`
//             startControl.setErrors(error)
//             return error
//         }
//     }
//
//     static prepareTableContent(semester: Readonly<Semester>, attr: string): string {
//         const value = semester[attr]
//
//         if (value instanceof Date) {
//             return format(value, 'dd.MM.yyyy')
//         } else {
//             return value
//         }
//     }
//
//     constructor(semesterService: SemesterService, dialog: MatDialog, alertService: AlertService) {
//         super(
//             () => semesterService,
//             dialog,
//             alertService,
//             SemestersComponent.columns(),
//             ['create', 'update'],
//             'label',
//             'Semester',
//             'Semester',
//             SemestersComponent.inputData,
//             model => model.label,
//             SemestersComponent.prepareTableContent,
//             SemestersComponent.empty,
//             SemestersComponent.startEndValidator
//         )
//     }
//
//     ngOnInit() {
//         super.ngOnInit()
//         this.fetchData()
//     }
//
//     create(output: FormOutputData[]): SemesterProtocol {
//         return withCreateProtocol(output, SemestersComponent.empty(), p => {
//             p.start = format(new Date(p.start), 'yyyy-MM-dd')
//             p.end = format(new Date(p.end), 'yyyy-MM-dd')
//             p.examStart = format(new Date(p.examStart), 'yyyy-MM-dd')
//         })
//     }
//
//     update(model: Semester, updatedOutput: FormOutputData[]): SemesterProtocol {
//         console.error(model)
//         console.error(updatedOutput)
//         return withCreateProtocol(updatedOutput, SemestersComponent.empty(), p => {
//             p.start = format(model.start, 'yyyy-MM-dd')
//             p.end = format(model.end, 'yyyy-MM-dd')
//             p.examStart = format(model.examStart, 'yyyy-MM-dd')
//         })
//     }
// }
