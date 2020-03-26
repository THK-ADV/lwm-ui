import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {fullUserName} from '../../utils/component.utils'
import dayGridPlugin from '@fullcalendar/daygrid'
import {FullCalendarComponent} from '@fullcalendar/angular'
import {color, whiteColor} from '../../utils/colors'
import {Time} from '../../models/time.model'
import {ScheduleEntryEvent} from '../../labwork-chain/schedule/view/schedule-view-model'
import {ReportCardEntryService} from '../../services/report-card-entry.service'
import {subscribe} from '../../utils/functions'
import {Subscription} from 'rxjs'

@Component({
    selector: 'lwm-reschedule',
    templateUrl: './reschedule.component.html',
    styleUrls: ['./reschedule.component.scss']
})
export class RescheduleComponent implements OnInit, OnDestroy {

    readonly calendarPlugins = [dayGridPlugin]
    @ViewChild('calendar') calendar: FullCalendarComponent

    dates: ScheduleEntryEvent[] = []
    private subs: Subscription[] = []

    static instance(
        dialog: MatDialog,
        e: ReportCardEntryAtom
    ): MatDialogRef<RescheduleComponent> {
        return dialog.open<RescheduleComponent>(RescheduleComponent, {
            minWidth: '800px',
            minHeight: '600px',
            data: [e],
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<RescheduleComponent>,
        private service: ReportCardEntryService,
        @Inject(MAT_DIALOG_DATA) public payload: [ReportCardEntryAtom]
    ) {
    }

    ngOnInit(): void {
        const current = this.reportCardEntry()

        this.subs.push(subscribe(
            this.service.getAllWithFilter(current.labwork.course),
            xs => this.dates = xs
                .map(x => this.makeEvent(x, current.id === x.id)))
        )
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    cancel = () =>
        this.dialogRef.close()

    confirm = () =>
        this.dialogRef.close(42)

    title = () =>
        `Termin von ${fullUserName(this.payload[0].student)} verschieben`

    earliestDate = () =>
        this.reportCardEntry().date

    private reportCardEntry = () => this.payload[0]

    private makeEvent = (e: ReportCardEntryAtom, current: boolean): ScheduleEntryEvent => {
        const backgroundColor = current ? color('primary') : color('accent')
        const borderColor = current ? 'black' : color('accent')
        const foregroundColor = whiteColor()

        return {
            allDay: false,
            start: Time.withNewDate(e.date, e.start).date,
            end: Time.withNewDate(e.date, e.end).date,
            title: `${e.assignmentIndex + 1}. ${e.label} - ${e.room.label}`,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
            textColor: foregroundColor,
        }
    }
}
