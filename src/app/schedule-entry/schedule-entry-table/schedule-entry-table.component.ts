import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom, ReportCardEntryType} from '../../models/report-card-entry.model'
import {distinctEntryTypeColumns} from '../../report-card-table/report-card-table-utils'
import {MatTableDataSource} from '@angular/material'
import {compareUsers} from '../../utils/sort'
import {fullUserName} from '../../utils/component.utils'
import {Router} from '@angular/router'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {isRescheduledInto} from '../schedule-entry.component'
import {Subscription} from 'rxjs'
import {latestReportCardReschedule} from '../../models/report-card-entry-reschedules.model'
import {ReportCardRescheduledAtom} from '../../models/report-card-rescheduled.model'

interface TableEntry {
    entry: ReportCardEntryAtom
    index: number
    annotations: number
    rescheduledInto: boolean
    rescheduledFrom: boolean
    retriedInto: boolean
}

@Component({
    selector: 'lwm-schedule-entry-table',
    templateUrl: './schedule-entry-table.component.html',
    styleUrls: ['./schedule-entry-table.component.scss']
})
export class ScheduleEntryTableComponent implements OnInit {

    constructor(
        private readonly router: Router,
    ) {
    }

    @Input() reportCardEntries: [ReportCardEntryAtom, number, ReportCardRescheduledAtom[]][]
    @Input() scheduleEntry: Readonly<ScheduleEntryAtom>

    dataSource: MatTableDataSource<TableEntry>
    columns: TableHeaderColumn[]
    displayedColumns: string[]
    subs: Subscription[] = []

    mousePosition = {x: 0, y: 0}

    ngOnInit(): void {
        const ds = this.makeDataSource()
        this.dataSource = ds.ds
        this.columns = ds.columns
        this.displayedColumns = ds.columns.map(_ => _.attr)
    }

    private makeDataSource = (): { ds: MatTableDataSource<TableEntry>, columns: TableHeaderColumn[] } => {
        const columns = [
            {attr: 'index', title: '#'},
            {attr: 'systemId', title: 'GMID'},
            {attr: 'name', title: 'Name'}
        ]

        const entryTypes: ReportCardEntryType[] = []

        const tableEntries: TableEntry[] = this.reportCardEntries
            .sort(([lhs], [rhs]) => compareUsers(lhs.student, rhs.student))
            .map(([entry, annotations, reschedules], i) => {
                entryTypes.push(...entry.entryTypes)

                const latestReschedule = latestReportCardReschedule(reschedules)
                const rescheduledInto = isRescheduledInto(this.scheduleEntry, latestReschedule)

                return ({
                    entry: entry,
                    index: i + 1,
                    annotations: annotations,
                    rescheduledInto: (latestReschedule && rescheduledInto) || false,
                    rescheduledFrom: (latestReschedule && !rescheduledInto) || false,
                    retriedInto: false
                })
            })

        return {
            columns: columns.concat(...distinctEntryTypeColumns(entryTypes)),
            ds: new MatTableDataSource(tableEntries)
        }
    }

    tableContentFor = (e: Readonly<TableEntry>, attr: string) => {
        switch (attr) {
            case 'index':
                return e.index
            case 'systemId':
                return e.entry.student.systemId
            case 'name':
                return fullUserName(e.entry.student)
            default:
                return 'unknown'
        }
    }

    // track mouse positions to disable click events if the user is selecting text

    onMouseDown = ($event: MouseEvent) => {
        this.mousePosition.x = $event.screenX
        this.mousePosition.y = $event.screenY
    }

    onClick = ($event: MouseEvent, e: ReportCardEntryAtom) => {
        if (this.mousePosition.x === $event.screenX && this.mousePosition.y === $event.screenY) {
            this.router.navigate(['students', e.student.id]) // TODO pass information to highlight report-card-entry
        }
    }
}
