import {Component, Input, OnInit} from '@angular/core'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {ReportCardRescheduledAtom} from '../../models/report-card-rescheduled.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {dateOrderingASC, isEmpty} from '../../utils/functions'

export type ReportCardEntryRowRescheduleModel = [ReportCardEntryAtom, ReportCardRescheduledAtom[]]

@Component({
    selector: 'lwm-report-card-entry-row-reschedule',
    templateUrl: './report-card-entry-row-reschedule.component.html',
    styleUrls: ['./report-card-entry-row-reschedule.component.scss']
})
export class ReportCardEntryRowRescheduleComponent {

    reportCardEntry: Readonly<ReportCardEntryAtom>
    reschedules: Readonly<ReportCardRescheduledAtom[]>
    isRescheduled_: boolean
    renderMultipleReschedules: boolean

    @Input() set entry(e: ReportCardEntryRowRescheduleModel) {
        this.reportCardEntry = e[0]
        this.reschedules = e[1].sort((a, b) => dateOrderingASC(a.lastModified, b.lastModified))
        this.isRescheduled_ = !isEmpty(this.reschedules)
        this.renderMultipleReschedules = this.reschedules.length > 1
    }

    @Input() column: string
    @Input() tableContentFor: (e: Readonly<ReportCardEntryAtom>, attr: string) => string

    readonly attrsAffectedByReschedule = [
        'date', 'start', 'end', 'room.label', 'label', 'assignmentIndex'
    ]

    readonly indexAttr = 'assignmentIndex'
    readonly rescheduleReasonAttr = 'label'

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
