import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {Observable, zip} from 'rxjs'
import {Labwork, LabworkAtom} from '../models/labwork.model'
import {map, switchMap} from 'rxjs/operators'
import {User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputString, FormInputTextArea} from '../shared-dialogs/forms/form.input.string'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from './form.validator'
import {CourseProtocol} from '../services/course.service'
import {CourseAtom} from '../models/course.model'
import {FormInputNumber} from '../shared-dialogs/forms/form.input.number'
import {AuthorityProtocol} from '../models/authority.model'

export const fetchLabwork$ = (route: ActivatedRoute, labworkService: LabworkService): Observable<LabworkAtom> => {
    return route.paramMap.pipe(
        map(paramMap => ({lid: paramMap.get('lid') || '', cid: paramMap.get('cid') || ''})),
        switchMap(({lid, cid}) => labworkService.get(cid, lid))
    )
}

export const makePath = (resource: string, courseId: string, labworkId?: string): string => {
    let r = `courses/${courseId}`

    if (labworkId) {
        r += `/labworks/${labworkId}`
    }

    r += `/${resource}`

    return r
}

export const formatUser = (user: User): string => {
    return `${user.lastname}, ${user.firstname} (${user.systemId})`
}

export const fullUserName = (user: User): string =>
    `${user.lastname}, ${user.firstname}`

export const toLabwork = (atom: LabworkAtom): Labwork => {
    return {
        label: atom.label,
        course: atom.course.id,
        degree: atom.degree.id,
        semester: atom.semester.id,
        description: atom.description,
        id: atom.id,
        published: atom.published,
        subscribable: atom.subscribable
    }
}

const getAllEmployees = (userService: UserService) =>
    userService.getAllWithFilter({
        attribute: 'status',
        value: 'employee'
    })

const getAllLecturer = (userService: UserService) =>
    userService.getAllWithFilter({
        attribute: 'status',
        value: 'lecturer'
    })

const getAllTeachingStaff = (userService: UserService) =>
    zip(getAllEmployees(userService), getAllLecturer(userService),)
        .pipe(map(users => users.flat()))

export const partialCourseFormInputData = (
    userService: UserService
): (attr: string, m: Readonly<CourseProtocol | CourseAtom>) => Omit<FormInput, 'formControlName' | 'displayTitle'> | undefined => {
    return (attr, m) => {
        const isModel = isUniqueEntity(m)

        switch (attr) {
            case 'label':
                return {
                    isDisabled: isModel,
                    data: new FormInputString(m.label)
                }
            case 'description':
                return {
                    isDisabled: false,
                    data: new FormInputTextArea(m.description)
                }
            case 'abbreviation':
                return {
                    isDisabled: false,
                    data: new FormInputString(m.abbreviation)
                }
            case 'lecturer':
                return {
                    isDisabled: isModel,
                    data: isUniqueEntity(m) ?
                        new FormInputString(`${m.lecturer.lastname}, ${m.lecturer.firstname}`) :
                        new FormInputOption<User>(
                            'lecturer',
                            invalidChoiceKey,
                            true,
                            value => `${value.lastname}, ${value.firstname}`,
                            getAllTeachingStaff(userService)
                        )
                }
            case 'semesterIndex':
                return {
                    isDisabled: false,
                    data: new FormInputNumber(m.semesterIndex)
                }
        }
    }
}


export const fullCourseFormInputData = (userService: UserService): (m: Readonly<CourseProtocol | CourseAtom>, im: boolean) => FormInput[] => {
    return (model, isModel) => {
        const fields = [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung'
            },
            {
                formControlName: 'description',
                displayTitle: 'Beschreibung'
            },
            {
                formControlName: 'abbreviation',
                displayTitle: 'Abkürzung'
            },
            {
                formControlName: 'lecturer',
                displayTitle: 'Dozent'
            },
            {
                formControlName: 'semesterIndex',
                displayTitle: 'Fachsemester'
            }
        ]

        // this is safe here, because we match all fields
        // tslint:disable-next-line:no-non-null-assertion
        return fields.map(x => ({...x, ...partialCourseFormInputData(userService)(x.formControlName, model)!!}))
    }
}

export const emptyCourseProtocol = (): CourseProtocol => {
    return {label: '', description: '', abbreviation: '', lecturer: '', semesterIndex: 0}
}

export const getInitials = (user?: User): string => {
    if (user) {
        return user.firstname.substring(0, 1).toUpperCase() + user.lastname.substring(0, 1).toUpperCase()
    } else {
        return 'n.a'
    }
}

export const emptyAuthorityProtocol = (): AuthorityProtocol => {
    return {user: '', role: '', course: ''}
}
