import {Component, Inject, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {AssignmentEntry} from '../../../models/assignment-plan.model'
import {AssignmentEntriesService} from '../../../services/assignment-entries.service'
import {LabworkService} from '../../../services/labwork.service'
import {LabworkAtom} from '../../../models/labwork.model'
import {map} from 'rxjs/operators'
import {Observable} from 'rxjs'

@Component({
    selector: 'lwm-assignment-entry-takeover-dialog',
    templateUrl: './assignment-entry-takeover-dialog.component.html',
    styleUrls: ['./assignment-entry-takeover-dialog.component.scss']
})
export class AssignmentEntryTakeoverDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<AssignmentEntryTakeoverDialogComponent, Readonly<string>>,
        @Inject(MAT_DIALOG_DATA) private current: LabworkAtom,
        private readonly assignmentEntryService: AssignmentEntriesService,
        private readonly labworkService: LabworkService
    ) {
    }

    private labworks$: Observable<LabworkAtom[]>
    private entries$: Observable<AssignmentEntry[]>
    private selected_: LabworkAtom

    private set selected(labwork: LabworkAtom) {
        this.selected_ = labwork
        this.entries$ = this.assignmentEntryService
            .getAllWithFilter(labwork.course.id, {attribute: 'labwork', value: labwork.id})
            .pipe(map(xs => xs.sort((lhs, rhs) => lhs.index - rhs.index)))
    }

    static instance(
        dialog: MatDialog,
        labwork: Readonly<LabworkAtom>
    ): MatDialogRef<AssignmentEntryTakeoverDialogComponent, Readonly<string>> {
        return dialog.open<AssignmentEntryTakeoverDialogComponent, LabworkAtom, Readonly<string>>(
            AssignmentEntryTakeoverDialogComponent,
            {
                data: labwork,
                panelClass: 'lwmAssignmentEntryTakeoverDialog'
            })
    }

    ngOnInit(): void {
        this.labworks$ = this.labworkService.getAll(this.current.course.id, this.current.semester.id).pipe(
            map(xs => xs
                .filter(x => x.id !== this.current.id)
                .sort((lhs, rhs) => lhs.label.localeCompare(rhs.label))
            )
        )
    }

    private cancel = () => this.dialogRef.close(undefined)

    private display = (e: AssignmentEntry): string => e.label

    private takeOver = () => this.dialogRef.close(this.selected_.id)
}
