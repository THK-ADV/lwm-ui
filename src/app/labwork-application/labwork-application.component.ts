import {Component, OnDestroy, OnInit} from '@angular/core'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {Observable, Subscription} from 'rxjs'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {ActivatedRoute} from '@angular/router'
import {fetchLabwork$, formatUser} from '../utils/component.utils'
import {LabworkService} from '../services/labwork.service'
import {format} from '../utils/lwmdate-adapter'
import {UserService} from '../services/user.service'
import {hasAnyRole, isAdmin} from '../utils/role-checker'
import {UserRole} from '../models/role.model'
import {userAuths} from '../security/user-authority-resolver'
import {LWMActionType} from '../table-action-button/lwm-actions'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {openDialogFromPayload, subscribeDeleteDialog} from '../shared-dialogs/dialog-open-combinator'
import {FormOutputData, FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {isUniqueEntity} from '../models/unique.entity.model'
import {LabworkAtom} from '../models/labwork.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {User} from '../models/user.model'
import {invalidChoiceKey} from '../utils/form.validator'
import {withCreateProtocol} from '../models/protocol.model'
import {subscribe} from '../utils/functions'
import {addToDataSource, removeFromDataSource, updateDataSource} from '../shared-dialogs/dataSource.update'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {AlertService} from '../services/alert.service'
import {initiateDownloadWithDefaultFilenameSuffix} from '../xls-download/xls-download'
import {ActionType} from '../abstract-header/abstract-header.component'

@Component({
    selector: 'lwm-labwork-application',
    templateUrl: './labwork-application.component.html',
    styleUrls: ['./labwork-application.component.scss']
})
export class LabworkApplicationComponent implements OnInit, OnDestroy {

    headerTitle: string
    columns: TableHeaderColumn[]
    tableContent: (model: Readonly<LabworkApplicationAtom>, attr: string) => string
    applications$: Observable<LabworkApplicationAtom[]>
    filterPredicate: (data: LabworkApplicationAtom, filter: string) => boolean

    canCreateOrUpdate: boolean
    canDownloadApplicants: boolean

    labwork: LabworkAtom
    private dataSource: MatTableDataSource<LabworkApplicationAtom>
    private subs: Subscription[]

    constructor(
        private readonly appService: LabworkApplicationService,
        private readonly labworkService: LabworkService,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly dialog: MatDialog,
        private readonly alert: AlertService
    ) {
        this.subs = []
        this.headerTitle = 'Anmeldungen'
        this.columns = [
            {attr: 'applicant.lastname', title: 'Student'},
            {attr: 'friends', title: 'Partnerwunsch'},
            {attr: 'lastModified', title: 'Datum'}
        ]
        this.tableContent = (app, attr) => {
            switch (attr) {
                case 'applicant.lastname':
                    return formatUser(app.applicant)
                case 'friends':
                    return app.friends.map(f => f.systemId).join(', ')
                case 'lastModified':
                    return format(app.lastModified, 'dd.MM.yyyy - HH:mm') + ' Uhr'
                default:
                    return app[attr]
            }
        }
        this.filterPredicate = (app, filter) =>
            app.applicant.systemId.toLowerCase().includes(filter) ||
            app.applicant.lastname.toLowerCase().includes(filter) ||
            app.applicant.firstname.toLowerCase().includes(filter) ||
            app.friends.some(f => f.systemId.toLowerCase().includes(filter)) ||
            format(app.lastModified, 'dd.MM.yyyy - HH:mm').includes(filter)
    }

    ngOnInit(): void {
        this.subs.push(subscribe(fetchLabwork$(this.route, this.labworkService), x => {
            this.labwork = x
            this.headerTitle += ` für ${x.label}`
            const isCM = hasAnyRole(userAuths(this.route), UserRole.courseManager, UserRole.admin)
            this.canCreateOrUpdate = !x.published && isCM
            this.canDownloadApplicants = isCM
            this.applications$ = this.appService.getAllByLabworkAtom(x.id)
        }))
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    actions = (): ActionType[] => {
        const actions: ActionType[] = []

        if (this.canCreateOrUpdate) {
            actions.push({type: 'create', label: undefined})
        }

        if (this.canDownloadApplicants) {
            actions.push({type: 'download', label: undefined})
        }

        return actions
    }

    initDataSource = (ds: MatTableDataSource<LabworkApplicationAtom>) =>
        this.dataSource = ds

    onAction = (event: LWMActionType) => {
        switch (event) {
            case 'create':
                this.create()
                break
            case 'download':
                this.download()
                break
            default:
                break
        }
    }

    private create = () => {
        this.subs.push(subscribe(
            this.openUpdateDialog(this.empty(), this.appService.create),
            addToDataSource(this.dataSource, this.alert)
        ))
    }

    private download = () => {
        const s = subscribe(this.appService.download(this.labwork.course.id, this.labwork.id), blob => {
            initiateDownloadWithDefaultFilenameSuffix('Anmeldungen', this.labwork, blob)
        })

        this.subs.push(s)
    }

    onEdit = (app: LabworkApplicationAtom) => {
        this.subs.push(subscribe(
            this.openUpdateDialog(app, p => this.appService.update(p, app.id)),
            u => updateDataSource(this.dataSource, this.alert)(u, (lhs, rhs) => lhs.id === rhs.id)
        ))
    }

    private empty = (): LabworkApplicationProtocol =>
        ({applicant: '', labwork: '', friends: []})

    private openUpdateDialog = (
        app: LabworkApplicationProtocol | LabworkApplicationAtom,
        andThen: (b: LabworkApplicationProtocol) => Observable<LabworkApplicationAtom>
    ) => {
        const isModel = isUniqueEntity(app)
        const mode = isModel ? DialogMode.edit : DialogMode.create

        const inputData = (): FormInput[] => {
            const makeRequest = () => {
                if (isAdmin(userAuths(this.route))) { // Admins can apply any students to a labwork. This is an exception!
                    return this.userService.getAllWithFilter({attribute: 'status', value: 'student'})
                } else {
                    return this.userService.getAllWithFilter({attribute: 'status', value: 'student'}, {
                        attribute: 'degree',
                        value: this.labwork.degree.id
                    })
                }
            }

            const fellowStudents$ = makeRequest()

            const friendFormInputAt = (i: 0 | 1) => {
                const controlName = i === 0 ? 'friends1' : 'friends2'

                if (isUniqueEntity(app) && app.friends.length >= i + 1) {
                    return new FormInputOption<User>(
                        controlName,
                        invalidChoiceKey,
                        false,
                        formatUser,
                        fellowStudents$,
                        0,
                        opts => opts.find(_ => _.id === app.friends[i].id)
                    )
                } else {
                    return new FormInputOption<User>(
                        controlName,
                        invalidChoiceKey,
                        false,
                        formatUser,
                        fellowStudents$,
                        0
                    )
                }
            }

            return [
                {
                    formControlName: 'applicant',
                    displayTitle: 'Student',
                    isDisabled: isModel,
                    data: isUniqueEntity(app) ?
                        new FormInputString(formatUser(app.applicant)) :
                        new FormInputOption<User>('applicant', invalidChoiceKey, true, formatUser, fellowStudents$)
                },
                {
                    formControlName: 'friends1',
                    displayTitle: 'Partnerwunsch 1 (Optional)',
                    isDisabled: false,
                    data: friendFormInputAt(0)
                },
                {
                    formControlName: 'friends2',
                    displayTitle: 'Partnerwunsch 2 (Optional)',
                    isDisabled: false,
                    data: friendFormInputAt(1)
                }
            ]
        }

        const makeProtocol = (output: FormOutputData[], existing?: LabworkApplicationAtom): LabworkApplicationProtocol => {
            return withCreateProtocol(output, this.empty(), p => {
                p.labwork = this.labwork.id
                p.applicant = existing?.applicant?.id ?? p.applicant
                p.friends = [p['friends1'], p['friends2']].filter(f => f !== '' && f !== 'undefined')
                return p
            })
        }

        const payload: FormPayload<LabworkApplicationProtocol> = {
            headerTitle: dialogTitle(mode, 'Anmeldung'),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData(),
            makeProtocol: output => makeProtocol(output, isUniqueEntity(app) ? app : undefined)
        }

        return openDialogFromPayload(this.dialog, payload, andThen)
    }

    onDelete = (app: LabworkApplicationAtom) => {
        const updateUI = (x: LabworkApplicationAtom) =>
            removeFromDataSource(this.dataSource, this.alert)(_ => _.id === x.id)

        const dialogRef = DeleteDialogComponent.instance(
            this.dialog,
            {label: `Anmeldung von ${formatUser(app.applicant)}`, id: app.id}
        )

        const s = subscribeDeleteDialog(
            dialogRef,
            this.appService.delete,
            updateUI,
            this.alert.reportError
        )

        this.subs.push(s)
    }
}
