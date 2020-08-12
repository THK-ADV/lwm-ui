import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core'
import {MAT_DIALOG_DATA, MatDatepickerInputEvent, MatDialog, MatDialogRef} from '@angular/material'
import {ReportCardEntryAtom} from '../../models/report-card-entry.model'
import {fullUserName} from '../../utils/component.utils'
import {ReportCardEntryService, RescheduleCandidate} from '../../services/report-card-entry.service'
import {Subscription} from 'rxjs'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {DIALOG_WIDTH} from '../../shared-dialogs/dialog-constants'
import {subscribe} from '../../utils/functions'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {ReportCardRescheduledProtocol, RescheduleService} from '../../services/reschedule.service'
import {switchMap} from 'rxjs/operators'

interface RescheduleViewModel {
    title: string
    submitTitle: string
}

@Component({
    selector: 'lwm-reschedule',
    templateUrl: './reschedule.component.html',
    styleUrls: ['./reschedule.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RescheduleComponent implements OnInit, OnDestroy {

    private subs: Subscription[] = []
    private rescheduleCandidates: RescheduleCandidate[]

    viewModel: RescheduleViewModel
    formGroup: FormGroup
    dateControl: FormControl
    selectionControl: FormControl
    reasonControl: FormControl
    slots: RescheduleCandidate[]

    static instance(
        dialog: MatDialog,
        e: ReportCardEntryAtom
    ): MatDialogRef<RescheduleComponent, ReportCardEntryAtom> {
        return dialog.open(RescheduleComponent, {
            width: DIALOG_WIDTH,
            data: [e],
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private readonly dialogRef: MatDialogRef<RescheduleComponent, ReportCardEntryAtom>,
        private readonly reportCardEntryService: ReportCardEntryService,
        private readonly rescheduleService: RescheduleService,
        @Inject(MAT_DIALOG_DATA) private payload: [ReportCardEntryAtom]
    ) {
        this.formGroup = new FormGroup({})
        this.dateControl = new FormControl(undefined, Validators.required)
        this.selectionControl = new FormControl(undefined, Validators.required)
        this.reasonControl = new FormControl(undefined, Validators.required)

        this.formGroup.addControl('date', this.dateControl)
        this.formGroup.addControl('selection', this.selectionControl)
        this.formGroup.addControl('reason', this.reasonControl)

        this.viewModel = {
            title: `Termin von ${fullUserName(this.payload[0].student)} verschieben`,
            submitTitle: 'Termin verschieben'
        }
    }

    ngOnInit(): void {
        const labwork = this.payload[0].labwork
        this.subs.push(subscribe(
            this.reportCardEntryService.rescheduleCandidates(labwork.course, labwork.semester),
            xs => this.rescheduleCandidates = xs
        ))
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    // add this if own slots are supported
    // dateClass = (d: Date): MatCalendarCellCssClasses =>
    //     this.rescheduleCandidates.find(_ => this.isSameDate(_.date, d)) ? 'example-custom-date-class' : ''

    isCandidateForRescheduling = (d: Date | null): boolean => {
        if (!d) {
            return false
        }

        return this.rescheduleCandidates.some(_ => this.isSameDate(_.date, d))
    }

    cancel = () =>
        this.dialogRef.close()

    onSubmit = () => {
        if (!this.formGroup.valid) {
            return
        }

        this.reschedule(
            this.selectionControl.value as RescheduleCandidate,
            this.reasonControl.value as string,
            e => this.dialogRef.close(e)
        )
    }

    onDateChange = ($event: MatDatepickerInputEvent<Date>) => {
        const date = $event.value

        if (!date) {
            return
        }

        this.slots = this.rescheduleCandidates.filter(d => this.isSameDate(d.date, date))
        this.selectionControl.setValue(this.slots[0]) // it is guaranteed that there is at least one slot
    }

    displaySlot = (slot: RescheduleCandidate): string =>
        `${formatTime(slot.start, 'HH:mm')} - ${formatTime(slot.end, 'HH:mm')} in ${slot.room.label}`

    private isSameDate = (lhs: Date, rhs: Date) =>
        lhs.getMonth() === rhs.getMonth() && lhs.getDate() === rhs.getDate()

    private reschedule = (candidate: RescheduleCandidate, reason: string, completion: (e: ReportCardEntryAtom) => void) => {
        const p: ReportCardRescheduledProtocol = {
            date: format(candidate.date, 'yyyy-MM-dd'),
            start: formatTime(candidate.start),
            end: formatTime(candidate.end),
            room: candidate.room.id,
            reason: reason
        }
        const entry = this.payload[0]
        const reschedule$ = this.rescheduleService.create(p, entry.labwork.course)
        const entry$ = this.reportCardEntryService.get(entry.id, entry.labwork.course)

        this.subs.push(subscribe(reschedule$.pipe(switchMap(_ => entry$)), completion))
    }
}
