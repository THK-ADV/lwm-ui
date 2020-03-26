import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {MatTableDataSource} from '@angular/material'
import {LWMAction, rescheduleAction} from '../table-action-button/lwm-actions'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {AuthorityAtom} from '../models/authority.model'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'

export interface ReportCardTableModel {
    dataSource: MatTableDataSource<ReportCardEntryAtom>,
    columns: TableHeaderColumn[]
}

@Component({
    selector: 'lwm-report-card-table',
    templateUrl: './report-card-table.component.html',
    styleUrls: ['./report-card-table.component.scss']
})
export class ReportCardTableComponent implements OnInit {

    @Input() tableModel: ReportCardTableModel
    @Input() auths: Readonly<AuthorityAtom[]>
    @Input() tableContentFor: (e: Readonly<ReportCardEntryAtom>, attr: string) => string

    private canReschedule: boolean

    canApprove: boolean

    displayedColumns: string []

    constructor() {
        this.displayedColumns = []
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

    private hasReschedulePermission = (auths: Readonly<AuthorityAtom[]>) =>
        hasAnyRole(auths, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    private hasApprovalPermission = (auths: Readonly<AuthorityAtom[]>) =>
        hasAnyRole(auths, UserRole.courseAssistant, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    actions = (): LWMAction[] => this.canReschedule ? [rescheduleAction()] : []

    reschedule = (e: ReportCardEntryAtom) => console.log('reschedule')
}
