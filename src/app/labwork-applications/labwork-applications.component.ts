import {Component, OnDestroy, OnInit} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {NotImplementedError, subscribe} from '../utils/functions'
import {ActivatedRoute} from '@angular/router'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString} from '../shared-dialogs/forms/form.input.string'
import {isUniqueEntity} from '../models/unique.entity.model'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {User} from '../models/user.model'
import {invalidChoiceKey} from '../utils/form.validator'
import {UserService} from '../services/user.service'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {withCreateProtocol} from '../models/protocol.model'
import {map, switchMap, tap} from 'rxjs/operators'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {LabworkService} from '../services/labwork.service'
import {LabworkAtom} from '../models/labwork.model'
import {Observable} from 'rxjs'
import {format} from '../utils/lwmdate-adapter'

@Component({
    selector: 'app-labwork-applications',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class LabworkApplicationsComponent
    extends AbstractCRUDComponent<LabworkApplicationProtocol, LabworkApplicationAtom>
    implements OnInit, OnDestroy {

    private labwork: LabworkAtom

    static columns = (): TableHeaderColumn[] => {
        return [
            {attr: 'applicant.lastname', title: 'Student'},
            {attr: 'friends', title: 'Partnerwunsch'},
            {attr: 'lastModified', title: 'Datum'}
        ]
    }

    static empty = (): LabworkApplicationProtocol => {
        return {applicant: '', labwork: '', friends: []}
    }

    static fetchLabwork = (route: ActivatedRoute, labworkService: LabworkService): Observable<LabworkAtom> => {
        return route.paramMap.pipe(
            map(paramMap => ({lid: paramMap.get('lid') || '', cid: paramMap.get('cid') || ''})),
            switchMap(({lid, cid}) => labworkService.get(cid, lid))
        )
    }

    static inputData =
        (userService: UserService, route: ActivatedRoute, labworkService: LabworkService)
            : (m: Readonly<LabworkApplicationProtocol | LabworkApplicationAtom>, im: boolean) => FormInput[] => {
            const getFriend = (friends: User[] | string[]): string => {
                const s = friends.shift()

                if (!s) {
                    return ''
                }

                return isUniqueEntity(s) ? s.systemId : s
            }

            const fellowStudents = LabworkApplicationsComponent.fetchLabwork(route, labworkService).pipe(
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
                                LabworkApplicationsComponent.formatUser,
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
                            LabworkApplicationsComponent.formatUser,
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
                            LabworkApplicationsComponent.formatUser,
                            options => subscribe(fellowStudents, options)
                        )
                    }
                ]
            }
        }

    static formatUser = (user: User): string => {
        return `${user.lastname}, ${user.firstname} (${user.systemId})`
    }

    static prepareTableContent = (app: Readonly<LabworkApplicationAtom>, attr: string): string => {
        switch (attr) {
            case 'applicant.lastname':
                return LabworkApplicationsComponent.formatUser(app.applicant)
            case 'friends':
                return app.friends.map(f => f.systemId).join(', ')
            case 'lastModified':
                return format(app.lastModified, 'dd.MM.yyyy - HH:mm') + ' Uhr'
            default:
                return app[attr]
        }
    }

    constructor(
        protected readonly service: LabworkApplicationService,
        protected readonly dialog: MatDialog,
        protected readonly alertService: AlertService,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService
    ) {
        super(
            service,
            dialog,
            alertService,
            LabworkApplicationsComponent.columns(),
            ['create'],
            'applicant.lastname',
            'Anmeldung',
            'Anmeldungen',
            LabworkApplicationsComponent.inputData(userService, route, labworkService),
            model => model.applicant.systemId,
            LabworkApplicationsComponent.prepareTableContent,
            LabworkApplicationsComponent.empty,
            () => undefined
        )
    }

    ngOnInit() {
        super.ngOnInit()
        this.setupDataSource()
        this.fetchApplications()
    }

    private fetchApplications() {
        const apps$ = LabworkApplicationsComponent.fetchLabwork(this.route, this.labworkService).pipe(
            tap(l => {
                this.headerTitle += ` für ${l.label}`
                this.labwork = l
            }),
            switchMap(l => this.service.getAllByLabwork(l.id))
        )

        this.fetchData(apps$)
    }

    private setupDataSource() {
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor
        this.dataSource.filterPredicate = (app, filter) => {
            return app.applicant.systemId.toLowerCase().includes(filter) ||
                app.applicant.lastname.toLowerCase().includes(filter) ||
                app.applicant.firstname.toLowerCase().includes(filter) ||
                app.friends.some(f => f.systemId.toLowerCase().includes(filter)) ||
                format(app.lastModified, 'dd.MM.yyyy - HH:mm').includes(filter)
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy()
        this.subs.forEach(s => s.unsubscribe())
    }

    create(output: FormOutputData[]): LabworkApplicationProtocol {
        return withCreateProtocol(output, LabworkApplicationsComponent.empty(), p => {
            p.labwork = this.labwork.id
            p.friends = [p['friends1'], p['friends2']].filter(f => f !== '' && f !== 'undefined')
        })
    }

    update(model: LabworkApplicationAtom, updatedOutput: FormOutputData[]): LabworkApplicationProtocol {
        return NotImplementedError()
    }
}
