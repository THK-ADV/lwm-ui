import {Component} from '@angular/core'
import {Creatable, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable} from 'rxjs'
import {Employee, Lecturer, StudentAtom, User} from '../models/user.model'
import {EmployeeProtocol, isStudentProtocol, StudentProtocol, UserService} from '../services/user.service'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {invalidChoiceKey} from '../utils/form.validator'
import {Degree} from '../models/degree.model'
import {DegreeService} from '../services/degree.service'
import {isStudentAtom} from '../utils/type.check.utils'
import {isUniqueEntity} from '../models/unique.entity.model'


@Component({
    selector: 'lwm-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent {

    columns: TableHeaderColumn[]
    users$: Observable<StudentAtom | Employee | Lecturer[]>
    creatable: Creatable<StudentProtocol | EmployeeProtocol, StudentAtom | Employee | Lecturer>

    constructor(
        private readonly service: UserService,
        private readonly degreeService: DegreeService,
    ) {
        this.columns = [
            {attr: 'lastname', title: 'Nachname'},
            {attr: 'firstname', title: 'Vorname'},
            {attr: 'systemId', title: 'GMID'},
            {attr: 'email', title: 'Email'},
            {attr: 'enrollment', title: 'Studiengang'},
        ]

        this.users$ = service.getAllAtomic()

        this.creatable = {
            dialogTitle: 'Benutzer',
            emptyProtocol: () => ({
                email: '',
                enrollment: '',
                firstname: '',
                lastname: '',
                registrationId: '',
                systemId: ''
            }),
            makeInput: (attr, d) => {
                if (!isUniqueEntity(d)) {
                    throw new Error('only updates are supported')
                }

                switch (attr) {
                    case 'systemId':
                        return {isDisabled: true, data: new FormInputString(d.systemId)}
                    case 'email':
                        return {isDisabled: true, data: new FormInputString(d.email)}
                    case 'firstname':
                        return {isDisabled: true, data: new FormInputString(d.firstname)}
                    case 'lastname':
                        return {isDisabled: false, data: new FormInputString(d.lastname)}
                }

                if (attr === 'enrollment' && isStudentAtom(d)) {
                    return {
                        isDisabled: false,
                        data: new FormInputOption<Degree>(
                            'enrollment',
                            invalidChoiceKey,
                            true,
                            x => x.label,
                            degreeService.getAll(),
                            200,
                            xs => xs.find(x => x.id === d.enrollment.id)
                        )
                    }
                }

                return undefined
            },
            commitProtocol: (p, d) => {
                if (!d) {
                    throw new Error('only updates are supported')
                }

                if (isStudentAtom(d) && isStudentProtocol(p)) {
                    return {
                        lastname: p.lastname,
                        enrollment: p.enrollment,
                        systemId: d.systemId,
                        firstname: d.firstname,
                        email: d.email,
                        registrationId: d.registrationId
                    }
                } else {
                    return {
                        lastname: p.lastname,
                        systemId: d.systemId,
                        firstname: d.firstname,
                        email: d.email
                    }
                }
            },
            update: service.update
        }
    }

    tableContent = (model: Readonly<User>, attr: string): string => {
        switch (attr) {
            case 'enrollment':
                return isStudentAtom(model) ? model.enrollment.label : ''
            default:
                return model[attr]
        }
    }
}
