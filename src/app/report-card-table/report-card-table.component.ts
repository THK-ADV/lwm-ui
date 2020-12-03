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
        private readonly dialog: MatDialog
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

    reschedule = (e: ReportCardEntryAtom) => {
        const $ = openDialog(RescheduleComponent.instance(this.dialog, e), of)
        this.subs.push(subscribe($, console.log))
    }
}
