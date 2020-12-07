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
import {ReportCardTableModel, ReschedulePresentationStrategy} from '../report-card-table/report-card-table.component'
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
    data$: Observable<[Readonly<ReportCardEntryAtom[]>, Readonly<ScheduleEntryAtom>]>

    constructor(
        private readonly route: ActivatedRoute,
        private readonly scheduleEntryService: ScheduleEntryService,
        private readonly reportCardService: ReportCardEntryService
    ) {
    }

    ngOnInit(): void {
        console.log('ScheduleEntryComponent onInit')
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

    supervisors = (x: Readonly<ScheduleEntryAtom>) =>
        x.supervisor.map(shortUserName).join(', ')

    group = (x: Readonly<ScheduleEntryAtom>) =>
        `Gruppe ${x.group.label}`

    participants = (xs: Readonly<ReportCardEntryAtom[]>, se: Readonly<ScheduleEntryAtom>) => {
        let honest = 0
        let rescheduledOut = 0
        let rescheduledIn = 0

        xs.forEach(x => {
            if (x.rescheduled !== undefined) {
                // TODO add support for retries
                if (this.isRescheduledInto(se, x)) {
                    rescheduledIn += 1
                } else {
                    rescheduledOut += 1
                }
            } else {
                honest += 1
            }
        })

        honest += rescheduledIn
        let base = `${honest} Teilnehmer`

        if (rescheduledIn !== 0 && rescheduledOut !== 0) {
            base += ` (${rescheduledIn} hinzugefügt und ${rescheduledOut} entfernt)`
        } else if (rescheduledIn !== 0) {
            base += ` (${rescheduledIn} hinzugefügt)`
        } else if (rescheduledOut !== 0) {
            base += ` (${rescheduledOut} entfernt)`
        }

        return base
    }

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

    isRescheduledInto = (s: ScheduleEntryAtom, e: ReportCardEntryAtom): boolean =>
        e.rescheduled !== undefined &&
        e.rescheduled.date.getTime() === s.date.getTime() &&
        e.rescheduled.start.equals(s.start) &&
        e.rescheduled.end.equals(s.end) &&
        e.rescheduled.room.id === s.room.id

    reschedulePresentationStrategy = (s: Readonly<ScheduleEntryAtom>): ReschedulePresentationStrategy => ({
        kind: 'from_into',
        indexAttr: 'systemId',
        isInto: e => this.isRescheduledInto(s, e)
    })

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

    showHeaderDetails = (xs: Readonly<ReportCardEntryAtom[]>) => {
        return xs.length > 0
    }

    assignmentText = (xs: Readonly<ReportCardEntryAtom[]>) => {
        return foldUndefined(
            first(xs),
            x => {
                const index = x.assignmentIndex + 1
                return `${index} - ${x.label}`
            },
            () => ``
        )
    }

    room = (x: Readonly<ScheduleEntryAtom>) => {
        return x.room.label
    }

    day = (x: Readonly<ScheduleEntryAtom>) =>
        format(x.date, 'dd.MM.yyyy')

    period = (x: Readonly<ScheduleEntryAtom>) => {
        const start = formatTime(x.start, 'HH:mm')
        const end = formatTime(x.end, 'HH:mm')
        return `${start}Uhr - ${end}Uhr`
    }

    headerTitle = (x: Readonly<ScheduleEntryAtom>) => {
        const labwork = x.labwork.label
        const group = x.group.label
        return `${labwork} - Gruppe ${group}`
    }
}
