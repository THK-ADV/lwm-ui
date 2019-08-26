import {Component, OnInit} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {CourseProtocol, CourseService} from '../services/course.service'
import {CourseAtom} from '../models/course.model'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {invalidChoiceKey} from '../utils/form.validator'
import {User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {subscribe} from '../utils/functions'
import {createProtocol, withCreateProtocol} from '../models/protocol.model'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString, FormInputTextArea} from '../shared-dialogs/forms/form.input.string'
import {FormInputNumber} from '../shared-dialogs/forms/form.input.number'

@Component({
    selector: 'app-courses',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class CoursesComponent extends AbstractCRUDComponent<CourseProtocol, CourseAtom> implements OnInit {

    static columns = (): TableHeaderColumn[] => {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'description', title: 'Beschreibung'},
            {attr: 'abbreviation', title: 'Abkürzung'},
            {attr: 'lecturer', title: 'Dozent'},
            {attr: 'semesterIndex', title: 'Fachsemester'}
        ]
    }

    static inputData = (userService: UserService): (m: Readonly<CourseProtocol | CourseAtom>, im: boolean) => FormInput[] => {
        return (model, isModel) => {
            return [
                {
                    formControlName: 'label',
                    displayTitle: 'Bezeichnung',
                    isDisabled: false,
                    data: new FormInputString(model.label)
                },
                {
                    formControlName: 'description',
                    displayTitle: 'Beschreibung',
                    isDisabled: false,
                    data: new FormInputTextArea(model.description)
                },
                {
                    formControlName: 'abbreviation',
                    displayTitle: 'Abkürzung',
                    isDisabled: false,
                    data: new FormInputString(model.abbreviation)
                },
                {
                    formControlName: 'lecturer',
                    displayTitle: 'Dozent',
                    isDisabled: isModel,
                    data: isUniqueEntity(model) ?
                        new FormInputString(`${model.lecturer.lastname}, ${model.lecturer.firstname}`) :
                        new FormInputOption<User>(
                            model.lecturer,
                            'lecturer',
                            invalidChoiceKey,
                            true,
                            value => `${value.lastname}, ${value.firstname}`,
                            userService.getAllWithFilter({attribute: 'status', value: 'employee'})
                        )
                },
                {
                    formControlName: 'semesterIndex',
                    displayTitle: 'Fachsemester',
                    isDisabled: false,
                    data: new FormInputNumber(model.semesterIndex)
                }
            ]
        }
    }

    static empty = (): CourseProtocol => {
        return {label: '', description: '', abbreviation: '', lecturer: '', semesterIndex: 0}
    }

    static prepareTableContent = (course: Readonly<CourseAtom>, attr: string): string => {
        if (attr === 'lecturer') {
            return `${course.lecturer.lastname}, ${course.lecturer.firstname}`
        } else {
            return course[attr]
        }
    }

    constructor(protected courseService: CourseService, protected dialog: MatDialog, protected alertService: AlertService, private userService: UserService) {
        super(
            courseService,
            dialog,
            alertService,
            CoursesComponent.columns(),
            ['create', 'update'],
            'label',
            'Modul',
            'Module',
            CoursesComponent.inputData(userService),
            _ => '',
            CoursesComponent.prepareTableContent,
            CoursesComponent.empty,
            () => undefined
        )
    }

    ngOnInit() {
        super.ngOnInit()
        this.fetchData()
    }

    create(output: FormOutputData[]): CourseProtocol {
        return createProtocol(output, CoursesComponent.empty())
    }

    update(model: CourseAtom, updatedOutput: FormOutputData[]): CourseProtocol {
        return withCreateProtocol(updatedOutput, CoursesComponent.empty(), p => {
            p.lecturer = model.lecturer.id
        })
    }
}
