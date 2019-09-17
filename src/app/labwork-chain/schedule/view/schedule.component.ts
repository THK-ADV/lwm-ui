import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'
import {makeScheduleEntryEvents, ScheduleEntryEvent} from './schedule-view-model'
import {TimetableAtom} from '../../../models/timetable'
import {LWMActionType} from '../../../table-action-button/lwm-actions'
import {DeleteDialogComponent} from '../../../shared-dialogs/delete/delete-dialog.component'
import {MatDialog} from '@angular/material'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {ScheduleEntryService} from '../../../services/schedule-entry.service'
import {openDialog} from '../../../shared-dialogs/dialog-open-combinator'
import {of, Subscription} from 'rxjs'
import {subscribe} from '../../../utils/functions'

@Component({
    selector: 'lwm-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>
    @Input() timetable: Readonly<TimetableAtom>
    @Input() hasReportCards: Readonly<boolean>

    @Output() deleteScheduleEmitter: EventEmitter<void>
    @Output() deleteReportCardsEmitter: EventEmitter<void>

    private dates: ScheduleEntryEvent[]
    private headerTitle: string
    private readonly subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly scheduleService: ScheduleEntryService,
        private readonly reportCardService: ReportCardEntryService
    ) {
        this.deleteScheduleEmitter = new EventEmitter<void>()
        this.deleteReportCardsEmitter = new EventEmitter<void>()
        this.subs = []
    }

    ngOnInit() {
        console.log('schedule component loaded')

        this.headerTitle = `[🔒] Staffelplan für ${this.labwork.label}`
        this.updateCalendar(this.scheduleEntries)
    }

    private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryAtom[]>) => {
        console.log('updating schedule cal')
        this.dates = makeScheduleEntryEvents(scheduleEntries)
    }

    private canDelete = (): LWMActionType[] => ['delete'] // TODO permission check

    private onDelete = () => {
        const dialogRef = DeleteDialogComponent.instance(
            this.dialog,
            {
                id: this.labwork.id,
                label: this.hasReportCards ?
                    `Staffelplan und Notenhefte für ${this.labwork.label}` :
                    `Staffelplan für ${this.labwork.label}`
            }
        )

        this.subs.push(subscribe(openDialog(dialogRef, of), this.delete0)) // TODO perform delete
    }

    private delete0 = () => {
        this.deleteScheduleEmitter.emit()
        this.deleteReportCardsEmitter.emit()
    }
}
