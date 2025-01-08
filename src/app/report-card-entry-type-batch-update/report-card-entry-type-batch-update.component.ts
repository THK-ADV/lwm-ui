import {Component, OnDestroy, OnInit} from '@angular/core'
import {ReportCardEntryTypeService} from '../services/report-card-entry-type.service'
import {ActivatedRoute} from '@angular/router'
import {params} from '../resolver/course-labwork-param-resolver'
import {userAuths} from '../security/user-authority-resolver'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'
import {AssignmentEntriesService} from '../services/assignment-entries.service'
import {identity, Observable, of, Subscription} from 'rxjs'
import {AssignmentEntry, AssignmentEntryType} from '../models/assignment-plan.model'
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {partitionWith, subscribe} from '../utils/functions'
import {User} from '../models/user.model'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {map} from 'rxjs/operators'
import {groupBy, mapMap} from '../utils/group-by'
import {openConfirmationDialog} from '../shared-dialogs/dialog-open-combinator'
import {MatDialog} from '@angular/material/dialog'
import {ConfirmDialogComponent} from '../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {AlertService} from '../services/alert.service'
import {LabworkService} from '../services/labwork.service'
import {LabworkAtom} from '../models/labwork.model'

@Component({
    selector: 'lwm-report-card-entry-type-batch-update',
    templateUrl: './report-card-entry-type-batch-update.component.html',
    styleUrls: ['./report-card-entry-type-batch-update.component.scss'],
    standalone: false
})
export class ReportCardEntryTypeBatchUpdateComponent implements OnInit, OnDestroy {

    private readonly attTrue = 'Anwesend'
    private readonly certTrue = 'Bestanden'
    private readonly suppTrue = 'Erhalten'
    private readonly attFalse = 'nicht anwesend'
    private readonly certFalse = 'nicht bestanden'
    private readonly suppFalse = 'nicht erhalten'

    private subs: Subscription[]

    private readonly labworkId: string
    private readonly courseId: string
    private readonly hasPermission: boolean
    readonly assignmentEntries: Observable<AssignmentEntry[]>
    readonly students: Observable<User[]>
    readonly labwork: Observable<LabworkAtom>

    readonly formGroup: FormGroup
    readonly assignmentEntryFc: FormControl
    readonly entryTypeFc: FormControl
    readonly entryTypeValueFc: FormControl
    readonly studentsFc: FormControl

    constructor(
        private readonly entryTypeService: ReportCardEntryTypeService,
        private readonly labworkService: LabworkService,
        private readonly assignmentEntryService: AssignmentEntriesService,
        private readonly reportCardEntryService: ReportCardEntryService,
        private readonly route: ActivatedRoute,
        private readonly dialog: MatDialog,
        private readonly alertService: AlertService
    ) {
        const p = params(route)
        this.labworkId = p.labwork
        this.courseId = p.course
        this.hasPermission = hasAnyRole(userAuths(route), UserRole.courseManager, UserRole.courseAssistant, UserRole.courseAssistant)

        this.labwork = labworkService.get(p.course, p.labwork)
        this.assignmentEntries = assignmentEntryService.getAllWithFilter(p.course, {attribute: 'labwork', value: p.labwork})
        this.students = this.reportCardEntryService.getAllWithFilter(p.course, {attribute: 'labwork', value: p.labwork}).pipe(
            map(xs => mapMap(groupBy(xs, e => e.student.id), (_, v) => v[0].student))
        )

        this.assignmentEntryFc = new FormControl(undefined, Validators.required)
        this.entryTypeFc = new FormControl(undefined, Validators.required)
        this.studentsFc = new FormControl(undefined, Validators.required)
        this.entryTypeValueFc = new FormControl(undefined, Validators.required)
        this.formGroup = new FormGroup({
            assignment: this.assignmentEntryFc,
            entryType: this.entryTypeFc,
            entryTypeValue: this.entryTypeValueFc,
            students: this.studentsFc
        })
        this.subs = []
    }

    ngOnInit(): void {

    }

    ngOnDestroy() {
        this.subs.forEach(_ => _.unsubscribe())
    }

    entryTypes = () =>
        (this.assignmentEntryFc.value as AssignmentEntry).types

    entryTypeIsBool = (): boolean => {
        switch ((this.entryTypeFc.value as AssignmentEntryType).entryType) {
            case 'Anwesenheitspflichtig':
            case 'Testat':
            case 'Zusatzleistung':
                return true
        }

        return false
    }


    entryTypeValues = () => {
        switch ((this.entryTypeFc.value as AssignmentEntryType).entryType) {
            case 'Anwesenheitspflichtig':
                return [this.attTrue, this.attFalse]
            case 'Testat':
                return [this.certTrue, this.certFalse]
            case 'Zusatzleistung':
                return [this.suppTrue, this.suppFalse]
        }

        return undefined
    }

    valueOfEntryType = (): boolean | number => {
        const value = this.entryTypeValueFc.value

        switch (value) {
            case this.attTrue:
            case this.certTrue:
            case this.suppTrue:
                return true
            case this.attFalse:
            case this.certFalse:
            case this.suppFalse:
                return false
        }

        return +value
    }

    sortAssignmentEntries = (a: AssignmentEntry, b: AssignmentEntry): number =>
        a.index - b.index

    onSubmit = (students: User[]) => {
        this.validateStudents(students)
    }

    private validateStudents = (students: User[]) => {
        const gmids = (this.studentsFc.value as string).split(',')

        const [valid, invalid] = partitionWith(gmids, gmid => students.find(s => s.systemId.toLowerCase() === gmid.toLowerCase()))

        if (valid.length === 0) {
            const dialogRef = ConfirmDialogComponent.instance(
                this.dialog,
                {
                    title: 'Keine validen Studierende gefunden',
                    body: {
                        kind: 'text',
                        value: `Folgende Studierenden wurden nicht gefunden: ${invalid.join(',')}. Bitte darauf achten, dass es sich um das richtige Praktikum handelt`
                    }
                }
            )

            this.subs.push(subscribe(openConfirmationDialog(dialogRef, of), identity))
            return
        }

        if (invalid.length > 0) {
            const dialogRef = ConfirmDialogComponent.instance(
                this.dialog,
                {
                    title: 'Fehlerhafte Studierende',
                    body: {
                        kind: 'text',
                        value: `Folgende Studierenden wurden nicht gefunden: ${invalid.join(',')}. Bitte darauf achten, dass es sich um das richtige Praktikum handelt. Trotzdem mit den anderen ${valid.length} fortfahren?`
                    }
                }
            )

            this.go(openConfirmationDialog(dialogRef, () => this.update(valid)))
        } else {
            this.go(this.update(valid))
        }
    }

    private go = ($: Observable<number>) =>
        this.subs.push(subscribe($, number => this.alertService.reportSuccess(`${number} Einträge aktualisiert`)))

    private update = (students: User[]): Observable<number> =>
        this.entryTypeService.updateMany(
            this.courseId,
            this.labworkId,
            students.map(_ => _.id),
            (this.assignmentEntryFc.value as AssignmentEntry).id,
            (this.entryTypeFc.value as AssignmentEntryType).entryType,
            this.valueOfEntryType()
        )

    isValidForm = () => this.formGroup.valid

    headerTitle = (labwork: LabworkAtom): string =>
        `Abnahmen vergeben in ${labwork.label} (${labwork.semester.abbreviation})`
}
