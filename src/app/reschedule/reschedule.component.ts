import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core'
import {MAT_DIALOG_DATA, MatCalendarCellCssClasses, MatDatepickerInputEvent, MatDialog, MatDialogRef} from '@angular/material'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {fullUserName} from '../utils/component.utils'
import {ReportCardEntryService, RescheduleCandidate} from '../services/report-card-entry.service'
import {Subscription} from 'rxjs'
import {isInThePast, subscribe} from '../utils/functions'
import {DIALOG_WIDTH} from '../shared-dialogs/dialog-constants'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {isDate} from '../utils/type.check.utils'
import {format, formatTime, LWMDateAdapter} from '../utils/lwmdate-adapter'
import {resetControl} from '../utils/form-control-utils'
import {ReportCardRescheduledProtocol} from '../models/report-card-rescheduled.model'
import {RescheduleService} from '../services/reschedule.service'
import {Time} from '../models/time.model'
import {Room} from '../models/room.model'

type DatePicked = 'candidate-date' | 'other-date' | 'none'
type ReschedulePickerMode = 'pick-available' | 'create-custom' | 'none'

@Component({
    selector: 'lwm-reschedule',
    templateUrl: './reschedule.component.html',
    styleUrls: ['./reschedule.component.scss'],
    providers: LWMDateAdapter.defaultProviders(),
    encapsulation: ViewEncapsulation.None,
})
export class RescheduleComponent implements OnInit, OnDestroy {

    readonly title: String
    readonly formGroup: FormGroup
    readonly dateControl: FormControl
    readonly reasonControl: FormControl
    readonly slotPickerControl: FormControl
    readonly modes: ReschedulePickerMode[]
    readonly reasons: string[]

    datePickedMode: DatePicked
    reschedulePickerMode: ReschedulePickerMode

    slots: RescheduleCandidate[]

    private subs: Subscription[]
    private rescheduleCandidates: RescheduleCandidate[]

    static instance(
        dialog: MatDialog,
        e: ReportCardEntryAtom
    ): MatDialogRef<RescheduleComponent, ReportCardEntryAtom> {
        return dialog.open<RescheduleComponent>(RescheduleComponent, {
            minWidth: DIALOG_WIDTH,
            data: [e],
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<RescheduleComponent, ReportCardEntryAtom>,
        private reportCardEntryService: ReportCardEntryService,
        private rescheduleService: RescheduleService,
        @Inject(MAT_DIALOG_DATA) public payload: [ReportCardEntryAtom]
    ) {
        this.title = `Termin ${this.payload[0].assignmentIndex + 1} (${this.payload[0].label}) von ${fullUserName(this.payload[0].student)} verschieben`
        this.subs = []
        this.rescheduleCandidates = []
        this.slots = []
        this.datePickedMode = 'none'
        this.reschedulePickerMode = 'none'
        this.modes = ['pick-available', 'create-custom']
        this.reasons = [
            'Krankheit',
            'Terminkollision',
            'Privat',
            'Sonstiges'
        ]

        this.dateControl = new FormControl(undefined, Validators.required)
        this.slotPickerControl = new FormControl(undefined, Validators.required)
        this.reasonControl = new FormControl(undefined, Validators.required)

        this.formGroup = new FormGroup({
            'date': this.dateControl,
            'slotPicker': this.slotPickerControl,
            'reason': this.reasonControl
        })
    }

    ngOnInit(): void {
        this.fetchRescheduleCandidates()
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe)
    }

    dateCSSClass = (d: Date): MatCalendarCellCssClasses =>
        this.rescheduleCandidates.find(_ => this.isSameDate(_.date, d)) ? 'example-custom-date-class' : ''

    onCancel = () =>
        this.dialogRef.close()

    onSubmit = () => {
        const isValid = (fc: FormControl): boolean =>
            fc.errors !== undefined

        const createOwn = () => {
            const start = this.formGroup.controls['start']
            const end = this.formGroup.controls['end']
            const room = this.formGroup.controls['room']

            if (![this.dateControl, this.reasonControl, start, end, room].every(isValid)) {
                return
            }

            const date = this.dateControl.value as Date
            const protocol = this.createProtocol(
                (room.value as Room).id,
                date,
                Time.fromTimeString(start.value, date),
                Time.fromTimeString(end.value, date),
                this.reasonControl.value
            )
            this.reschedule(protocol)
        }

        const createFromPick = () => {
            if (![this.dateControl, this.slotPickerControl, this.reasonControl].every(isValid)) {
                return
            }

            const candidate = this.slotPickerControl.value as RescheduleCandidate
            const protocol = this.createProtocol(
                candidate.room.id,
                candidate.date,
                candidate.start,
                candidate.end,
                this.reasonControl.value
            )

            this.reschedule(protocol)
        }

        switch (this.datePickedMode) {
            case 'other-date':
                createOwn()
                break
            case 'candidate-date':
                switch (this.reschedulePickerMode) {
                    case 'pick-available':
                        createFromPick()
                        break
                    case 'create-custom':
                        createOwn()
                        break
                    case 'none':
                        break
                }
                break
            case 'none':
                break
        }
    }

    onDateChange = ($event: MatDatepickerInputEvent<unknown>) => {
        const date = $event.value

        if (!isDate(date)) {
            return
        }

        this.slots = this.rescheduleCandidates.filter(d => this.isSameDate(d.date, date))
        this.datePickedMode = this.slots.length > 0 ? 'candidate-date' : 'other-date'
        this.reschedulePickerMode = 'none'

        // slot picker is not required if user chooses custom slots
        this.resetSlotPickerControls()
    }

    slotLabel = (slot: RescheduleCandidate): string => {
        const start = formatTime(slot.start, 'HH:mm')
        const end = formatTime(slot.end, 'HH:mm')
        return `${start} - ${end} Uhr in ${slot.room.label}`
    }

    modeLabel = (mode: ReschedulePickerMode): string => {
        switch (mode) {
            case 'create-custom':
                return 'Neuen Termin erstellen'
            case 'pick-available':
                return 'Aus verfügbaren Terminen wählen'
            default:
                return ''
        }
    }

    reschedulePickerModeDidChange = (mode: ReschedulePickerMode) =>
        this.resetSlotPickerControls()

    private createProtocol = (room: string, date: Date, start: Time, end: Time, reason: string): ReportCardRescheduledProtocol =>
        ({
            reportCardEntry: this.reportCardEntry().id,
            reason: reason,
            room: room,
            date: format(date, 'yyyy-MM-dd'),
            start: formatTime(start, 'HH:mm:ss'),
            end: formatTime(end, 'HH:mm:ss')
        })

    private reschedule = (protocol: ReportCardRescheduledProtocol) => {
        this.subs.push(subscribe(
            this.rescheduleService.create(this.reportCardEntry().labwork.course, protocol),
            res => this.dialogRef.close({...this.reportCardEntry(), rescheduled: res})
        ))
    }

    private resetSlotPickerControls = () =>
        resetControl(this.slotPickerControl)

    private isSameDate = (lhs: Date, rhs: Date) =>
        lhs.getMonth() === rhs.getMonth() && lhs.getDate() === rhs.getDate()

    private reportCardEntry = () => this.payload[0]

    private fetchRescheduleCandidates = () => {
        const labwork = this.reportCardEntry().labwork

        const filterPastDates = (xs: RescheduleCandidate[]) =>
            xs.filter(x => isInThePast(x.date))

        this.subs.push(subscribe(
            this.reportCardEntryService.rescheduleCandidates(labwork.course, labwork.semester),
            xs => this.rescheduleCandidates = filterPastDates(xs)
        ))
    }
}
