import {Component} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {CourseProtocol, CourseService} from '../services/course.service'
import {CourseAtom} from '../models/course'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {FormInputData, FormInputOption, FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {Validators} from '@angular/forms'
import {invalidChoiceKey, optionsValidator} from '../utils/form.validator'
import {User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {subscribe} from '../utils/functions'
import {createProtocol, withCreateProtocol} from '../models/protocol'

@Component({
    selector: 'app-courses',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class CoursesComponent extends AbstractCRUDComponent<CourseProtocol, CourseAtom> {

    static columns(): TableHeaderColumn[] {
        return [
            {attr: 'label', title: 'Bezeichnung'},
            {attr: 'description', title: 'Beschreibung'},
            {attr: 'abbreviation', title: 'Abkürzung'},
            {attr: 'lecturer', title: 'Dozent'},
            {attr: 'semesterIndex', title: 'Fachsemester'}
        ]
    }

    static inputData(model: Readonly<CourseProtocol | CourseAtom>, isModel: boolean): FormInputData[] {
        const isCourseAtom = (course: Readonly<CourseProtocol | CourseAtom>): course is CourseAtom => {
            return (course as CourseAtom).lecturer.firstname !== undefined
        }

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
                formControlName: 'description',
                placeholder: 'Beschreibung',
                type: 'textArea',
                isDisabled: false,
                validator: Validators.required,
                value: model.description
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
                formControlName: 'lecturer',
                placeholder: 'Dozent',
                type: isModel ? 'text' : 'options',
                isDisabled: isModel,
                validator: isModel ? Validators.required : optionsValidator(),
                value: isCourseAtom(model) ? `${model.lecturer.lastname}, ${model.lecturer.firstname}` : ''
            },
            {
                formControlName: 'semesterIndex',
                placeholder: 'Fachsemester',
                type: 'number',
                isDisabled: false,
                validator: [Validators.required, Validators.min(0)],
                value: model.semesterIndex
            }
        ]
    }

    static empty(): CourseProtocol {
        return {label: '', description: '', abbreviation: '', lecturer: '', semesterIndex: 0}
    }

    static prepareTableContent(course: Readonly<CourseAtom>, attr: string): string {
        if (attr === 'lecturer') {
            return `${course.lecturer.lastname}, ${course.lecturer.firstname}`
        } else {
            return course[attr]
        }
    }

    constructor(protected courseService: CourseService, protected dialog: MatDialog, protected alertService: AlertService, private userService: UserService) {
        super(
            dialog,
            alertService,
            CoursesComponent.columns(),
            ['create', 'update'],
            'label',
            'Modul',
            'Module',
            CoursesComponent.inputData,
            _ => '',
            CoursesComponent.prepareTableContent,
            CoursesComponent.empty,
            () => undefined
        )

        this.service = courseService // super.init does not allow types which are generic
        this.inputOption = new FormInputOption<User>(
            'lecturer',
            invalidChoiceKey,
            value => `${value.lastname}, ${value.firstname}`,
            options => subscribe(userService.getAllEmployees(), options)
        )
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
