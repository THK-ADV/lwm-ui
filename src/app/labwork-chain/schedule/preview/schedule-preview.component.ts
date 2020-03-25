import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {TimetableAtom} from '../../../models/timetable'
import {ScheduleEntryEvent} from '../view/schedule-view-model'
import {ScheduleEntryGen, ScheduleEntryService} from '../../../services/schedule-entry.service'
import {LWMActionType} from '../../../table-action-button/lwm-actions'
import {ConfirmDialogComponent} from '../../../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {MatDialog} from '@angular/material'
import {subscribeConfirmationDialog, subscribeDeleteDialog} from '../../../shared-dialogs/dialog-open-combinator'
import {of, Subscription} from 'rxjs'
import {createSchedule, makeScheduleEntryEvents} from './schedule-preview-view-model'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'
import {DeleteDialogComponent} from '../../../shared-dialogs/delete/delete-dialog.component'
import {voidF} from '../../../utils/functions'
import {LoadingService, withSpinning} from '../../../services/loading.service'

@Component({
    selector: 'lwm-schedule-preview',
    templateUrl: './schedule-preview.component.html',
    styleUrls: ['./schedule-preview.component.scss']
})
export class SchedulePreviewComponent implements OnInit, OnDestroy {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
    @Input() hasPermission: Readonly<boolean>

    private _entries: Readonly<ScheduleEntryGen[]>

    @Input() set entries(entries: Readonly<ScheduleEntryGen[]>) {
        this.updateCalendar(entries)
        this._entries = entries
    }

    @Output() createScheduleEmitter: EventEmitter<ScheduleEntryAtom[]>
    @Output() deleteSchedulePreviewEmitter: EventEmitter<void>

    dates: ScheduleEntryEvent[]
    headerTitle: string
    private subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly service: ScheduleEntryService,
        private readonly loadingService: LoadingService
    ) {
        this.createScheduleEmitter = new EventEmitter<ScheduleEntryAtom[]>()
        this.deleteSchedulePreviewEmitter = new EventEmitter<void>()
        this.subs = []
    }

    ngOnInit() {
        console.log('schedule preview component loaded')

        this.headerTitle = `Staffelplan-Vorschau für ${this.labwork.label}`
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }

    private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryGen[]>) => {
        console.log('updating schedule preview cal')
        this.dates = makeScheduleEntryEvents(scheduleEntries)
    }

    canDeleteAndCommit = (): LWMActionType[] => this.hasPermission ? ['delete', 'upload'] : []

    performAction = (action: LWMActionType) => {
        switch (action) {
            case 'delete':
                this.delete()
                break
            case 'upload':
                this.commit()
                break
            default:
                break
        }
    }

    private delete = () => {
        const dialogRef = DeleteDialogComponent.instance(
            this.dialog,
            {
                id: this.labwork.id,
                label: 'Staffelplan-Vorschau inkl. Gruppen'
            }
        )

        const s = subscribeDeleteDialog(
            dialogRef,
            of,
            () => this.deleteSchedulePreviewEmitter.emit(),
            console.log
        )

        this.subs.push(s)
    }

    private commit = () => {
        const dialogRef = ConfirmDialogComponent.instance(
            this.dialog,
            {title: 'Staffelplan erstellen', body: {kind: 'text', value: 'Möchten Sie den Staffelplan erstellen?'}},
        )

        const spinning = withSpinning<ScheduleEntryAtom[]>(this.loadingService)

        const s = subscribeConfirmationDialog(
            dialogRef,
            () => spinning(createSchedule(this.labwork.course.id, this.labwork.id, this._entries, this.service)),
            xs => this.createScheduleEmitter.emit(xs),
            voidF
        )

        this.subs.push(s)
    }
}
