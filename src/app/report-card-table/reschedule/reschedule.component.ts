import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core'
import {MAT_DIALOG_DATA, MatCalendarCellCssClasses, MatDatepickerInputEvent, MatDialog, MatDialogRef} from '@angular/material'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {fullUserName} from '../../utils/component.utils'
import {ReportCardEntryService, RescheduleCandidate} from '../../services/report-card-entry.service'
import {Subscription} from 'rxjs'
import {isInThePast, subscribe} from '../../utils/functions'
import {DIALOG_WIDTH} from '../../shared-dialogs/dialog-constants'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {isDate} from '../../utils/type.check.utils'
import {formatTime} from '../../utils/lwmdate-adapter'

type DatePicked = 'candidate-date' | 'other-date' | 'none'
type ReschedulePickerMode = 'pick-available' | 'create-custom' | 'none'

@Component({
    selector: 'lwm-reschedule',
    templateUrl: './reschedule.component.html',
    styleUrls: ['./reschedule.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RescheduleComponent implements OnInit, OnDestroy {

    readonly title: String
    readonly formGroup: FormGroup
    readonly dateControl: FormControl
    readonly slotPickerControl: FormControl
    readonly modes: ReschedulePickerMode[]

    datePickedMode: DatePicked
    reschedulePickerMode: ReschedulePickerMode

    slots: RescheduleCandidate[]

    private subs: Subscription[]
    private rescheduleCandidates: RescheduleCandidate[]

    static instance(
        dialog: MatDialog,
        e: ReportCardEntryAtom
    ): MatDialogRef<RescheduleComponent> {
        return dialog.open<RescheduleComponent>(RescheduleComponent, {
            width: DIALOG_WIDTH,
            data: [e],
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<RescheduleComponent>,
        private reportCardEntryService: ReportCardEntryService,
        @Inject(MAT_DIALOG_DATA) public payload: [ReportCardEntryAtom]
    ) {
        this.title = `Termin von ${fullUserName(this.payload[0].student)} verschieben`
        this.subs = []
        this.rescheduleCandidates = []
        this.slots = []
        this.datePickedMode = 'none'
        this.reschedulePickerMode = 'none'
        this.modes = ['pick-available', 'create-custom']

        this.dateControl = new FormControl(undefined, Validators.required)
        this.slotPickerControl = new FormControl(undefined, Validators.required)

        this.formGroup = new FormGroup({
            'date': this.dateControl,
            'slotPicker': this.slotPickerControl,
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
        if (this.formGroup.valid) {
            console.log(this.dateControl.value)
            console.log(this.slotPickerControl.value)
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

    reschedulePickerModeDidChange = (mode: ReschedulePickerMode) => {
        console.log(mode)
        this.resetSlotPickerControls()
    }

    private resetSlotPickerControls = () => {
        this.slotPickerControl.setValue(undefined)
    }

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
