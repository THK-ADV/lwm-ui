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

        this.dateControl = new FormControl(undefined, Validators.required)
        this.formGroup = new FormGroup({
            'date': this.dateControl
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

    onSubmit = () =>
        this.dialogRef.close(42)

    onDateChange = ($event: MatDatepickerInputEvent<unknown>) => {
        const date = $event.value

        if (!isDate(date)) {
            return
        }

        const slots = this.rescheduleCandidates.filter(d => this.isSameDate(d.date, date))

        if (slots.length === 0) {
            // chose own slots
        } else {
            // chose one of available slots
        }

        // this.selectionControl.setValue(this.slots[0]) // it is guaranteed that there is at least one slot
    }

    private isSameDate = (lhs: Date, rhs: Date) =>
        lhs.getMonth() === rhs.getMonth() && lhs.getDate() === rhs.getDate() // ???

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
