import {Component, OnDestroy, OnInit} from '@angular/core'
import {AbstractCRUDComponent, TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../models/labwork.application.model'
import {NotImplementedError} from '../utils/functions'
import {ActivatedRoute} from '@angular/router'
import {MatDialog} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {UserService} from '../services/user.service'
import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'
import {switchMap, tap} from 'rxjs/operators'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {LabworkService} from '../services/labwork.service'
import {LabworkAtom} from '../models/labwork.model'
import {format} from '../utils/lwmdate-adapter'
import {
    createLabworkApplicationProtocol,
    emptyLabworkApplicationProtocol,
    fetchLabwork$,
    formatUser,
    labworkApplicationFormInputData
} from '../utils/component.utils'
import {hasCourseManagerPermission} from '../security/user-authority-resolver'

@Component({
    selector: 'app-labwork-applications',
    templateUrl: '../abstract-crud/abstract-crud.component.html',
    styleUrls: ['../abstract-crud/abstract-crud.component.scss']
})
export class LabworkApplicationsComponent
    extends AbstractCRUDComponent<LabworkApplicationProtocol, LabworkApplicationAtom>
    implements OnInit, OnDestroy {

    private labwork: Readonly<LabworkAtom>
    private hasPermission: Readonly<boolean>

    static columns = (): TableHeaderColumn[] => {
        return [
            {attr: 'applicant.lastname', title: 'Student'},
            {attr: 'friends', title: 'Partnerwunsch'},
            {attr: 'lastModified', title: 'Datum'}
        ]
    }

    static prepareTableContent = (app: Readonly<LabworkApplicationAtom>, attr: string): string => {
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
            [],
            'applicant.lastname',
            'Anmeldung',
            'Anmeldungen',
            labworkApplicationFormInputData(userService, route, labworkService),
            model => model.applicant.systemId,
            LabworkApplicationsComponent.prepareTableContent,
            emptyLabworkApplicationProtocol,
            () => undefined
        )

        this.hasPermission = false
    }

    ngOnInit() {
        super.ngOnInit()
        this.setupDataSource()
        this.fetchApplications()
    }

    private fetchApplications() {
        const apps$ = fetchLabwork$(this.route, this.labworkService).pipe(
            tap(l => {
                this.headerTitle += ` für ${l.label}`
                this.labwork = l

                this.setupPermissionChecks(l.course.id)
            }),
            switchMap(l => this.service.getAllByLabworkAtom(l.id))
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

    private setupPermissionChecks = (courseId: string) => {
        this.hasPermission = hasCourseManagerPermission(this.route, courseId)
        // if (!this.hasPermission) {
        //     this.updateActions(['create', 'delete']) // TODO
        // }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy()
        this.subs.forEach(s => s.unsubscribe())
    }

    create(output: FormOutputData[]): LabworkApplicationProtocol {
        return createLabworkApplicationProtocol(output, this.labwork.id)
    }

    update(model: LabworkApplicationAtom, updatedOutput: FormOutputData[]): LabworkApplicationProtocol {
        return NotImplementedError()
    }
}
