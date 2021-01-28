import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {ReportCardRescheduledAtom} from '../../models/report-card-rescheduled.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'

@Component({
    selector: 'lwm-report-card-entry-row-reschedule',
    templateUrl: './report-card-entry-row-reschedule.component.html',
    styleUrls: ['./report-card-entry-row-reschedule.component.scss']
})
export class ReportCardEntryRowRescheduleComponent implements OnInit {

    @Input() entry: ReportCardEntryAtom
    @Input() column: string
    @Input() tableContentFor: (e: Readonly<ReportCardEntryAtom>, attr: string) => string

    readonly attrsAffectedByReschedule = [
        'date', 'start', 'end', 'room.label', 'label', 'assignmentIndex'
    ]

    readonly indexAttr = 'assignmentIndex'
    readonly rescheduleReasonAttr = 'label'

    constructor() {
    }

    ngOnInit(): void {
    }

    isRescheduled = (e: ReportCardEntryAtom) =>
        e.rescheduled !== undefined

    isAffectedByRescheduled = (attr: string): boolean =>
        this.attrsAffectedByReschedule.includes(attr)

    rescheduledContentFor = (e: ReportCardRescheduledAtom, attr: string) => {
        switch (attr) {
            case 'date':
                return format(e.date, 'dd.MM.yyyy')
            case 'start':
                return formatTime(e.start, 'HH:mm')
            case 'end':
                return formatTime(e.end, 'HH:mm')
            case 'room.label':
                return e.room.label
            case 'label':
                return e.reason ?? 'Kein Grund angegeben'
            default:
                return ''
        }
    }

}
