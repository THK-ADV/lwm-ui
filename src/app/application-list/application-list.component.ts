import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../models/labwork.model'
import {LabworkApplicationAtom} from '../models/labwork.application.model'
import {mapUndefined, subscribe, voidF} from '../utils/functions'
import {format} from '../utils/lwmdate-adapter'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {openDialog, subscribeDeleteDialog} from '../shared-dialogs/dialog-open-combinator'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {AlertService} from '../services/alert.service'
import {Subscription} from 'rxjs'
import {MatDialog} from '@angular/material'
import {StudentCreateApplicationComponent} from './student-create-application/student-create-application.component'
import {StudentAtom} from '../models/user.model'

@Component({
    selector: 'lwm-application-list',
    templateUrl: './application-list.component.html',
    styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit, OnDestroy {

    @Input() labworks: LabworkAtom[]
    @Input() apps: LabworkApplicationAtom[]
    @Input() applicant: StudentAtom

    @Output() applicationEmitter: EventEmitter<[Readonly<LabworkApplicationAtom>, 'add' | 'delete' | 'update']>

    private subs: Subscription[]
    // subscribable && !published view and modify
    // !subscribable && !published
    //  -> isApplicant: read only view
    //  -> !isApplicant: no view

    // !subscribable && published no view

    constructor(
        private readonly labworkApplicationService: LabworkApplicationService,
        private readonly alert: AlertService,
        private readonly dialog: MatDialog
    ) {
        this.applicationEmitter = new EventEmitter()
        this.subs = []
    }

    ngOnInit() {
        this.labworks = this.labworks.filter(this.shouldShowApplication)
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private labworkApplication = (labworkId: string): LabworkApplicationAtom | undefined =>
        this.apps.find(x => x.labwork.id === labworkId)

    private shouldShowApplication = (labwork: LabworkAtom) => {
        if (labwork.published) {
            return false
        }

        return labwork.subscribable || this.isApplicant(labwork.id)
    }

    isApplicant = (labworkId: string) =>
        this.apps.some(_ => _.labwork.id === labworkId)

    canModifyApplication = (labwork: LabworkAtom) =>
        labwork.subscribable && !labwork.published

    applicationTimestamp = (labwork: LabworkAtom) =>
        mapUndefined(this.labworkApplication(labwork.id), app => format(app.lastModified, 'dd.MM.yyyy - HH:mm'))

    modifyApplication = (labwork: LabworkAtom) => {
        const app = this.labworkApplication(labwork.id)

        if (!app) {
            return
        }

        const $ = openDialog(
            StudentCreateApplicationComponent.instance(this.dialog, labwork, app.applicant.id, app),
            p => this.labworkApplicationService.updateForSelf(p, app.id)
        )

        const s = subscribe($, _ => this.applicationEmitter.emit([_, 'update']))

        this.subs.push(s)
    }

    revokeApplication = (labwork: LabworkAtom) => {
        const application = this.labworkApplication(labwork.id)
        if (!application) {
            return
        }

        const dialogData = {label: `Praktikumsanmeldung für ${labwork.label} vom ${this.applicationTimestamp(labwork)}`, id: application.id}
        const sub = subscribeDeleteDialog(
            DeleteDialogComponent.instance(this.dialog, dialogData),
            this.labworkApplicationService.deleteForSelf,
            app => this.applicationEmitter.emit([app, 'delete']),
            voidF
        )

        this.subs.push(sub)
    }

    apply = (labwork: LabworkAtom) => {
        const $ = openDialog(
            StudentCreateApplicationComponent.instance(this.dialog, labwork, this.applicant.id, undefined),
            this.labworkApplicationService.createForSelf
        )

        this.subs.push(subscribe($, x => this.applicationEmitter.emit([x, 'add'])))
    }
}
