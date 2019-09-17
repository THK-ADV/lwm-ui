import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {TimetableAtom} from '../../models/timetable'
import {ScheduleEntryEvent} from '../schedule/schedule-view-model'
import {ScheduleEntryGen, SchedulePreview} from '../../services/schedule-entry.service'
import {LWMActionType} from '../../table-action-button/lwm-actions'
import {ConfirmDialogComponent} from '../../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {MatDialog} from '@angular/material'
import {openDialog} from '../../shared-dialogs/dialog-open-combinator'
import {of, Subscription} from 'rxjs'
import {subscribe} from '../../utils/functions'
import {makeScheduleEntryEvents} from './schedule-preview-view-model'

@Component({
    selector: 'lwm-schedule-preview',
    templateUrl: './schedule-preview.component.html',
    styleUrls: ['./schedule-preview.component.scss']
})
export class SchedulePreviewComponent implements OnInit, OnDestroy {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
    @Input() set entries (entries: Readonly<ScheduleEntryGen[]>) {
        this.updateCalendar(entries)
    }

    private dates: ScheduleEntryEvent[]
    private headerTitle: string
    private subs: Subscription[]

    constructor(
       private readonly dialog: MatDialog
    ) {
        this.subs = []
    }

    ngOnInit() {
        console.log('schedule preview component loaded')

        this.headerTitle = `[🔓] Staffelplan-Vorschau für ${this.labwork.label}`
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }

    private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryGen[]>) => {
        console.log('updating schedule preview cal')
        this.dates = makeScheduleEntryEvents(scheduleEntries)
    }

    private canCommit = (): LWMActionType | undefined => 'upload' // TODO permission check

    private commit = () => {
        const dialog = ConfirmDialogComponent.instance(
            this.dialog,
            'Staffelplan erstellen',
            'Möchten Sie den Staffelplan erstellen?'
        )

        this.subs.push(subscribe(openDialog(dialog, of), console.log)) // TODO commit
    }
}
