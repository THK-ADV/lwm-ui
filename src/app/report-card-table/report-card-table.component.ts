import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {MatTableDataSource} from '@angular/material'
import {LWMAction, rescheduleAction} from '../table-action-button/lwm-actions'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {AuthorityAtom} from '../models/authority.model'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'

@Component({
    selector: 'lwm-report-card-table',
    templateUrl: './report-card-table.component.html',
    styleUrls: ['./report-card-table.component.scss']
})
export class ReportCardTableComponent implements OnInit {

    @Input() dataSource: MatTableDataSource<ReportCardEntryAtom>
    @Input() columns: TableHeaderColumn[]
    @Input() auths: AuthorityAtom[]

    private canReschedule: boolean
    displayedColumns: string []

    constructor() {
        this.displayedColumns = []
    }

    ngOnInit() {
        this.canReschedule = this.hasReschedulePermission(this.auths)

        const c = this.columns.map(_ => _.attr)

        if (this.canReschedule) {
            c.push('action')
        }

        this.displayedColumns = c
    }

    private hasReschedulePermission = (auths: AuthorityAtom[]) =>
        hasAnyRole(auths, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    tableContentFor = (e: ReportCardEntryAtom, attr: string) => {
        switch (attr) {
            case 'date':
                return format(e.date, 'dd.MM.yyyy')
            case 'start':
                return formatTime(e.start, 'HH:mm')
            case 'end':
                return formatTime(e.end, 'HH:mm')
            case 'assignmentIndex':
                return e.assignmentIndex + 1
            case 'room.label':
                return e.room.label
            default:
                return e[attr]
        }
    }

    actions = (): LWMAction[] => this.canReschedule ? [rescheduleAction()] : []

    reschedule = (e: ReportCardEntryAtom) => console.log('reschedule')
}
