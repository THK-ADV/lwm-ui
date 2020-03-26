import {Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {EMPTY, Observable, of, zip} from 'rxjs'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {switchMap} from 'rxjs/operators'
import {ScheduleEntryService} from '../services/schedule-entry.service'
import {ScheduleEntryAtom} from '../models/schedule-entry.model'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {shortUserName} from '../labwork-chain/timetable/timetable-view-model'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {MatTableDataSource} from '@angular/material'
import {ReportCardTableModel} from '../report-card-table/report-card-table.component'
import {userAuths} from '../security/user-authority-resolver'
import {distinctEntryTypeColumns} from '../report-card-table/report-card-table-utils'
import {fullUserName} from '../utils/component.utils'
import {compareUsers} from '../utils/sort'
import {first, foldUndefined} from '../utils/functions'

@Component({
    selector: 'lwm-schedule-entry',
    templateUrl: './schedule-entry.component.html',
    styleUrls: ['./schedule-entry.component.scss']
})
export class ScheduleEntryComponent implements OnInit {
    // TODO support rescheduled entries

    data$: Observable<[Readonly<ReportCardEntryAtom[]>, Readonly<ScheduleEntryAtom>]>

    constructor(
        private readonly route: ActivatedRoute,
        private readonly scheduleEntryService: ScheduleEntryService,
        private readonly reportCardService: ReportCardEntryService
    ) {
    }

    ngOnInit(): void {
        // TODO you can access the data in route either directly via snapshot or stream via observable
        // TODO e.g. this.route.snapshot.paramMap.get('cid')

        this.data$ = this.route.paramMap.pipe(
            switchMap(map => {
                const cid = map.get('cid')
                const sid = map.get('sid')
                return cid && sid ? of([cid, sid]) : EMPTY
            }),
            switchMap(([cid, sid]) => zip(this.reportCardService.fromScheduleEntry(cid, sid), this.scheduleEntryService.get(cid, sid)))
        )
    }

    headerTitle = (s: Readonly<ScheduleEntryAtom>, xs: Readonly<ReportCardEntryAtom[]>) =>
        foldUndefined(
            first(xs),
            x => `Termin ${x.assignmentIndex + 1} vom ${format(s.date, 'dd.MM.yyyy')}, ${formatTime(s.start, 'HH:mm')} - ${formatTime(s.end, 'HH:mm')} Uhr in Raum ${s.room.label}`,
            () => `Abnahme hat keine Teilnehmer`
        )

    supervisors = (x: Readonly<ScheduleEntryAtom>) =>
        x.supervisor.map(shortUserName).join(', ')

    group = (x: Readonly<ScheduleEntryAtom>) =>
        `Gruppe ${x.group.label}`

    participants = (xs: Readonly<ReportCardEntryAtom[]>) =>
        `${xs.length} Teilnehmer`

    assignment = (x: Readonly<ReportCardEntryAtom>) =>
        x.label

    dataSource = (xs: ReportCardEntryAtom[]): ReportCardTableModel => {
        const columns = [
            {attr: 'systemId', title: 'GMID'},
            {attr: 'name', title: 'Name'},
            ...distinctEntryTypeColumns(xs.flatMap(_ => _.entryTypes))
        ]

        return {
            columns: columns,
            dataSource: new MatTableDataSource<ReportCardEntryAtom>(
                xs.sort((lhs, rhs) => compareUsers(lhs.student, rhs.student))
            )
        }
    }

    tableContentFor = (e: Readonly<ReportCardEntryAtom>, attr: string) => {
        switch (attr) {
            case 'systemId':
                return e.student.systemId
            case 'name':
                return fullUserName(e.student)
            default:
                return e[attr]
        }
    }

    auths = () =>
        userAuths(this.route)
}
