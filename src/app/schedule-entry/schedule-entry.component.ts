import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {EMPTY, Subscription, zip} from 'rxjs'
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
import {first, foldUndefined, subscribe} from '../utils/functions'
import {AuthorityAtom} from '../models/authority.model'

interface HeaderView {
    title: string
    assignment: string
    room: string
    date: string
    timePeriod: string
    supervisors: string
    participants: string
}

@Component({
    selector: 'lwm-schedule-entry',
    templateUrl: './schedule-entry.component.html',
    styleUrls: ['./schedule-entry.component.scss']
})
export class ScheduleEntryComponent implements OnInit, OnDestroy {

    headerView: HeaderView
    auths: AuthorityAtom[]
    reschedulePresentationStrategy: ReschedulePresentationStrategy
    tableModel: ReportCardTableModel

    subs: Subscription[] = []

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly scheduleEntryService: ScheduleEntryService,
        private readonly reportCardService: ReportCardEntryService,
    ) {
        this.auths = userAuths(route)
    }

    ngOnInit(): void {
        // TODO you can access the data in route either directly via snapshot or stream via observable
        // TODO e.g. this.route.snapshot.paramMap.get('cid')

        this.subs.push(subscribe(
            this.route.paramMap.pipe(
                switchMap(map => {
                    const cid = map.get('cid')
                    const sid = map.get('sid')
                    return cid && sid
                        ? zip(this.reportCardService.fromScheduleEntry(cid, sid), this.scheduleEntryService.get(cid, sid))
                        : EMPTY
                })
            ),
            data => this.updateUI(data[0], data[1])
        ))
    }

    ngOnDestroy() {
        this.subs.forEach(_ => _.unsubscribe())
    }

    isRescheduledInto = (s: ScheduleEntryAtom, e: ReportCardEntryAtom): boolean =>
        e.rescheduled !== undefined &&
        e.rescheduled.date.getTime() === s.date.getTime() &&
        e.rescheduled.start.equals(s.start) &&
        e.rescheduled.end.equals(s.end) &&
        e.rescheduled.room.id === s.room.id

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

    onReportCardEntry = (e: ReportCardEntryAtom) =>
        this.router.navigate(['students', e.student.id]) // TODO pass information to highlight report-card-entry

    // UI builder

    private updateUI = (reportCardEntries: Readonly<ReportCardEntryAtom[]>, scheduleEntry: Readonly<ScheduleEntryAtom>) => {
        this.headerView = this.makeHeaderView(scheduleEntry, reportCardEntries)
        this.reschedulePresentationStrategy = this.makeReschedulePresentationStrategy(scheduleEntry)
        this.tableModel = this.makeTableModel(reportCardEntries)
    }

    private makeTableModel = (xs: Readonly<ReportCardEntryAtom[]>): ReportCardTableModel => {
        console.log('datasource', xs)
        const columns = [
            {attr: 'systemId', title: 'GMID'},
            {attr: 'name', title: 'Name'}
        ]

        return {
            columns: columns.concat(...distinctEntryTypeColumns(xs.flatMap(_ => _.entryTypes))),
            dataSource: new MatTableDataSource(
                [...xs]
                    .sort((lhs, rhs) => compareUsers(lhs.student, rhs.student))
                    .map(e => ({entry: e, annotationCount: 0}))
            ) // TODO
        }
    }

    private makeReschedulePresentationStrategy = (s: Readonly<ScheduleEntryAtom>): ReschedulePresentationStrategy => ({
        kind: 'from_into',
        indexAttr: 'systemId',
        isInto: e => this.isRescheduledInto(s, e)
    })

    // header view builder

    private makeHeaderView = (s: Readonly<ScheduleEntryAtom>, e: Readonly<ReportCardEntryAtom[]>): HeaderView => ({
        title: this.headerTitle(s),
        assignment: this.assignmentLabel(e),
        date: this.dateLabel(s),
        participants: this.participantsLabel(e, s),
        room: this.roomLabel(s),
        supervisors: this.supervisorLabel(s),
        timePeriod: this.timePeriodLabel(s)
    })

    private supervisorLabel = (x: Readonly<ScheduleEntryAtom>) =>
        x.supervisor.map(shortUserName).join(', ')

    private participantsLabel = (xs: Readonly<ReportCardEntryAtom[]>, se: Readonly<ScheduleEntryAtom>) => {
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

    private assignmentLabel = (xs: Readonly<ReportCardEntryAtom[]>) => {
        return foldUndefined(
            first(xs),
            x => {
                const index = x.assignmentIndex + 1
                return `${index} - ${x.label}`
            },
            () => ``
        )
    }

    private roomLabel = (x: Readonly<ScheduleEntryAtom>) => {
        return x.room.label
    }

    private dateLabel = (x: Readonly<ScheduleEntryAtom>) =>
        format(x.date, 'dd.MM.yyyy')

    private timePeriodLabel = (x: Readonly<ScheduleEntryAtom>) => {
        const start = formatTime(x.start, 'HH:mm')
        const end = formatTime(x.end, 'HH:mm')
        return `${start} Uhr - ${end} Uhr`
    }

    private headerTitle = (x: Readonly<ScheduleEntryAtom>) => {
        const labwork = x.labwork.label
        const group = x.group.label
        return `${labwork} - Gruppe ${group}`
    }
}
