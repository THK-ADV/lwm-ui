import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {Observable} from 'rxjs'
import {Labwork, LabworkAtom} from '../models/labwork.model'
import {map, switchMap} from 'rxjs/operators'
import {User} from '../models/user.model'
import {UserService} from '../services/user.service'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {FormInput, FormInputData} from '../shared-dialogs/forms/form.input'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from './form.validator'
import {subscribe} from './functions'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {withCreateProtocol} from '../models/protocol.model'
import {TooltipPosition} from '@angular/material'
import {AbstractControl} from '@angular/forms'

export const fetchLabwork = (route: ActivatedRoute, labworkService: LabworkService): Observable<LabworkAtom> => {
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

export const labworkApplicationFormInputData =
    (userService: UserService, route: ActivatedRoute, labworkService: LabworkService)
        : (m: Readonly<LabworkApplicationProtocol | LabworkApplicationAtom>, im: boolean) => FormInput[] => {
        const getFriend = (friends: User[] | string[]): string => {
            const s = friends.shift()

            if (!s) {
                return ''
            }

            return isUniqueEntity(s) ? s.systemId : s
        }

        const fellowStudents = fetchLabwork(route, labworkService).pipe(
            switchMap(l => userService.getAllWithFilter(
                {attribute: 'status', value: 'student'},
                {attribute: 'degree', value: l.degree.id}
            ))
        )

        return (model, isModel) => {
            return [
                {
                    formControlName: 'applicant',
                    displayTitle: 'Student',
                    isDisabled: isModel,
                    data: isUniqueEntity(model) ?
                        new FormInputString(model.applicant.systemId) :
                        new FormInputOption<User>(
                            model.applicant,
                            'applicant',
                            invalidChoiceKey,
                            true,
                            formatUser,
                            options => subscribe(fellowStudents, options)
                        )
                },
                {
                    formControlName: 'friends1',
                    displayTitle: 'Partnerwunsch 1 (Optional)',
                    isDisabled: isModel,
                    data: new FormInputOption<User>(
                        getFriend(model.friends),
                        'friends1',
                        invalidChoiceKey,
                        false,
                        formatUser,
                        options => subscribe(fellowStudents, options)
                    )
                },
                {
                    formControlName: 'friends2',
                    displayTitle: 'Partnerwunsch 2 (Optional)',
                    isDisabled: isModel,
                    data: new FormInputOption<User>(
                        getFriend(model.friends),
                        'friends2',
                        invalidChoiceKey,
                        false,
                        formatUser,
                        options => subscribe(fellowStudents, options)
                    )
                }
            ]
        }
    }

export const emptyLabworkApplicationProtocol = (): LabworkApplicationProtocol => {
    return {applicant: '', labwork: '', friends: []}
}

export const createLabworkApplicationProtocol = (output: FormOutputData[], labworkId: string): LabworkApplicationProtocol => {
    return withCreateProtocol(output, emptyLabworkApplicationProtocol(), p => {
        p.labwork = labworkId
        p.friends = [p['friends1'], p['friends2']].filter(f => f !== '' && f !== 'undefined')
    })
}

export type LWMActionType = 'edit' | 'delete' | 'schedule' | 'groups' | 'graduates' | 'applications' | 'create' | 'swap'

export interface LWMAction {
    type: LWMActionType
    color: LWMColor
    iconName: string
    tooltipName: string
    tooltipPosition: TooltipPosition
}

export const scheduleAction = (): LWMAction => {
    return {type: 'schedule', color: 'primary', iconName: 'schedule', tooltipName: 'Staffelplan', tooltipPosition: 'above'}
}

export const labworkApplicationAction = (): LWMAction => {
    return {type: 'applications', color: 'accent', iconName: 'assignment_ind', tooltipName: 'Anmeldungen', tooltipPosition: 'above'}
}

export const groupAction = (): LWMAction => {
    return {type: 'groups', color: 'accent', iconName: 'group', tooltipName: 'Gruppen', tooltipPosition: 'above'}
}

export const graduatesAction = (): LWMAction => {
    return {type: 'graduates', color: 'accent', iconName: 'school', tooltipName: 'Absolventen', tooltipPosition: 'above'}
}

export const editAction = (): LWMAction => {
    return {type: 'edit', color: 'accent', iconName: 'edit', tooltipName: 'Bearbeiten', tooltipPosition: 'above'}
}

export const deleteAction = (): LWMAction => {
    return {type: 'delete', color: 'warn', iconName: 'delete', tooltipName: 'Löschen', tooltipPosition: 'above'}
}

export const createAction = (): LWMAction => {
    return {type: 'create', color: 'primary', iconName: 'add', tooltipName: 'Hinzufügen', tooltipPosition: 'above'}
}

export const swapAction = (): LWMAction => {
    return {type: 'swap', color: 'accent', iconName: 'swap_horiz', tooltipName: 'Wechseln', tooltipPosition: 'above'}
}

export const isOption = (d: FormInputData<any>): d is FormInputOption<any> => {
    return (d as FormInputOption<any>).options !== undefined
}

export const foreachOption = (inputs: FormInput[], f: (o: FormInputOption<any>) => void) => {
    inputs.forEach(d => {
        if (isOption(d.data)) {
            // @ts-ignore
            f(d.data)
        }
    })
}

export const hasOptionError = (formInputData: FormInputData<any>): boolean => {
    return isOption(formInputData) ? formInputData.hasError() : false
}

export const getOptionErrorMessage = (formInputData: FormInputData<any>): string => {
    return isOption(formInputData) ? formInputData.getErrorMessage() : ''
}

export const resetControls = (controls: AbstractControl[]) => {
    controls.forEach(resetControl)
}

export const resetControl = (control: AbstractControl) => {
    control.setValue('', {emitEvent: true})
    control.markAsUntouched()
}

