import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {AuthorityAtom} from '../models/authority.model'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'
import {openDialog} from '../shared-dialogs/dialog-open-combinator'
import {RescheduleComponent} from '../reschedule/reschedule.component'
import {of, Subscription} from 'rxjs'
import {subscribe} from '../utils/functions'
import {ReportCardRescheduledAtom} from '../models/report-card-rescheduled.model'
import {updateDataSource} from '../shared-dialogs/dataSource.update'
import {AlertService} from '../services/alert.service'

export interface ReportCardTableModel {
    dataSource: MatTableDataSource<ReportCardEntryAtom>,
    columns: TableHeaderColumn[]
}

@Component({
    selector: 'lwm-report-card-table',
    templateUrl: './report-card-table.component.html',
    styleUrls: ['./report-card-table.component.scss']
})
export class ReportCardTableComponent implements OnInit, OnDestroy {

    @Input() attrsAffectedByReschedule: string[]
    @Input() rescheduleReasonAttr: string
    @Input() indexAttr: string
    @Input() tableModel: ReportCardTableModel
    @Input() auths: Readonly<AuthorityAtom[]>
    @Input() tableContentFor: (e: Readonly<ReportCardEntryAtom>, attr: string) => string
    @Input() rescheduledContentFor: (e: Readonly<ReportCardRescheduledAtom>, attr: string) => string

    canReschedule: boolean
    canApprove: boolean
    displayedColumns: string []

    private subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly alertService: AlertService
    ) {
        this.displayedColumns = []
        this.subs = []
        this.tableContentFor = (e, attr) => e[attr]
        this.rescheduledContentFor = (e, attr) => e[attr]
        this.attrsAffectedByReschedule = []
        this.rescheduleReasonAttr = ''
        this.indexAttr = ''
    }

    ngOnInit() {
        this.canReschedule = this.hasReschedulePermission(this.auths)
        this.canApprove = this.hasApprovalPermission(this.auths)

        const c = this.tableModel.columns.map(_ => _.attr)

        if (this.canReschedule) {
            c.push('action')
        }

        this.displayedColumns = c
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private hasReschedulePermission = (auths: Readonly<AuthorityAtom[]>) =>
        hasAnyRole(auths, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    private hasApprovalPermission = (auths: Readonly<AuthorityAtom[]>) =>
        hasAnyRole(auths, UserRole.courseAssistant, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    reschedule = (e: ReportCardEntryAtom) => {
        this.subs.push(subscribe(
            openDialog(RescheduleComponent.instance(this.dialog, e), of),
            this.updateTable
        ))
    }

    private updateTable = (e: ReportCardEntryAtom) => {
        const update = updateDataSource(this.tableModel.dataSource, this.alertService)
        update(e, (lhs, rhs) => lhs.id === rhs.id)
    }

    // a report card entry can only be rescheduled once by now. add support for multiple reschedules later on
    canPerformRescheduleAction = (e: ReportCardEntryAtom) =>
        this.canReschedule && e.rescheduled === undefined

    isAffectedByRescheduled = (e: ReportCardEntryAtom, attr: string): boolean =>
        e.rescheduled !== undefined && this.attrsAffectedByReschedule.includes(attr)
}
