import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {TimetableAtom} from '../../../models/timetable'
import {ScheduleEntryEvent} from '../view/schedule-view-model'
import {ScheduleEntryGen} from '../../../services/schedule-entry.service'
import {LWMActionType} from '../../../table-action-button/lwm-actions'
import {ConfirmDialogComponent} from '../../../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {MatDialog} from '@angular/material'
import {openDialog} from '../../../shared-dialogs/dialog-open-combinator'
import {of, Subscription} from 'rxjs'
import {subscribe} from '../../../utils/functions'
import {makeScheduleEntryEvents} from './schedule-preview-view-model'
import {ScheduleEntryAtom} from '../../../models/schedule-entry.model'
import {Room} from '../../../models/room.model'
import {User} from '../../../models/user.model'
import {DeleteDialogComponent} from '../../../shared-dialogs/delete/delete-dialog.component'

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

    private dates: ScheduleEntryEvent[]
    private headerTitle: string
    private subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog
    ) {
        this.createScheduleEmitter = new EventEmitter<ScheduleEntryAtom[]>()
        this.deleteSchedulePreviewEmitter = new EventEmitter<void>()
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

    private canDeleteAndCommit = (): LWMActionType[] => this.hasPermission ? ['delete', 'upload'] : []

    private performAction = (action: LWMActionType) => {
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

        this.subs.push(subscribe(openDialog(dialogRef, of), this.delete0))
    }

    private delete0 = () => {
        this.deleteSchedulePreviewEmitter.emit()
    }

    private commit = () => {
        const dialog = ConfirmDialogComponent.instance(
            this.dialog,
            'Staffelplan erstellen',
            'Möchten Sie den Staffelplan erstellen?'
        )

        this.subs.push(subscribe(openDialog(dialog, of), this.commit0)) // TODO commit
    }

    private commit0 = () => {
        const fakeRoom: Room = ({id: '1', label: 'fake', capacity: 1, description: 'fake desc'})
        const fakeUser: User = ({id: '1', systemId: 'fakeId', lastname: 'fake last', firstname: 'fake first', email: 'fake mail'})

        this.createScheduleEmitter.emit(this._entries.map((v, i) => ({
            id: i.toString(),
            room: fakeRoom,
            group: v.group,
            start: v.start,
            end: v.end,
            date: v.date,
            labwork: this.labwork,
            supervisor: [fakeUser]
        })))
    }
}
