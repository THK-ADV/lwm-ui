import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {AuthorityAtom} from '../models/authority.model'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'
import {Subscription} from 'rxjs'
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

    @Input() tableModel: ReportCardTableModel
    @Input() auths: Readonly<AuthorityAtom[]>
    @Input() tableContentFor: (e: Readonly<ReportCardEntryAtom>, attr: string) => string

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

    reschedule = (e: ReportCardEntryAtom) => { // TODO update UI
        e = {
            ...e,
            rescheduled: {
                date: e.date,
                start: e.start,
                end: e.end,
                id: '1',
                room: e.room,
                reason: 'Ein Grund'
            }
        }

        updateDataSource(this.tableModel.dataSource, this.alertService)(e, (a, b) => a.id === b.id)

        // const $ = openDialog(RescheduleComponent.instance(this.dialog, e), _ => of(_))
        // this.subs.push(subscribe($, _ => NotImplementedError()))
    }

    isRescheduled = (e: ReportCardEntryAtom): boolean =>
        e.rescheduled !== undefined
}
