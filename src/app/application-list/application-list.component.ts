import { Component, Input, EventEmitter, Output, OnDestroy } from '@angular/core'
import { LabworkAtom } from '../models/labwork.model'
import { LabworkApplicationAtom } from '../models/labwork.application.model'
import { mapUndefined } from '../utils/functions'
import { format } from '../utils/lwmdate-adapter'
import { DeleteDialogComponent } from '../shared-dialogs/delete/delete-dialog.component'
import { subscribeDeleteDialog } from '../shared-dialogs/dialog-open-combinator'
import { LabworkApplicationService } from '../services/labwork-application.service'
import { AlertService } from '../services/alert.service'
import { Subscription } from 'rxjs'
import { MatDialog } from '@angular/material'

@Component({
    selector: 'lwm-application-list',
    templateUrl: './application-list.component.html',
    styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnDestroy  {

    @Input() labworks: LabworkAtom[]
    @Input() apps: LabworkApplicationAtom[]

    @Output() applicationUpdate: EventEmitter<Readonly<LabworkApplicationAtom>>

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
        this.applicationUpdate = new EventEmitter<Readonly<LabworkApplicationAtom>>()
        this.subs = []
    }
    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    labworkApplication = (labworkId: string): LabworkApplicationAtom | undefined =>
        this.apps.find(x => x.labwork.id === labworkId)

    isApplicant = (labworkId: string) =>
        this.apps.some(_ => _.labwork.id === labworkId)

    shouldShowApplication = (labwork: LabworkAtom) => {
        if (labwork.published) {
            return false
        }

        return labwork.subscribable || this.isApplicant(labwork.id)
    }

    canModifyApplication = (labwork: LabworkAtom) =>
        labwork.subscribable && !labwork.published

    applicationTimestamp = (labwork: LabworkAtom) =>
        mapUndefined(this.labworkApplication(labwork.id), app => format(app.lastModified, 'dd.MM.yyyy - HH:mm'))

    modifyApplication = (labwork: LabworkAtom) => {

    }

    revokeApplication = (labwork: LabworkAtom) => {
        const application = this.labworkApplication(labwork.id)
        if(!application) return null
        const dialogData = {label: `Praktikumsanmeldung für ${labwork.label} vom ${this.applicationTimestamp(labwork)}`, id: application.id}
        const sub = subscribeDeleteDialog(
            DeleteDialogComponent.instance(this.dialog, dialogData),
            this.labworkApplicationService.delete,
            app => {
                this.apps = this.apps.filter(_ => _.labwork.id !== app.labwork.id)
                this.alert.reportSuccess(JSON.stringify(app))
                this.applicationUpdate.emit(app)
            },
            err => mapUndefined(err, _ => this.alert.reportError(_))
        )
        this.subs.push(sub)
    }

    apply = (labwork: LabworkAtom) => {

    }
}
