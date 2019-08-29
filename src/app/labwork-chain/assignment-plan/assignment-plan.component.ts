import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {EMPTY, Observable, Subscription} from 'rxjs'
import {LabworkAtom} from '../../models/labwork.model'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {
    AssignmentEntry,
    AssignmentEntryType,
    AssignmentEntryTypeValue,
    AssignmentPlan,
    findEntryTypeValue,
    sortedAssignmentPlanEntryTypes
} from '../../models/assignment-plan.model'
import {AssignmentPlanService} from '../../services/assignment-plan.service'
import {foldUndefined, parseUnsafeBoolean, parseUnsafeNumber, subscribe} from '../../utils/functions'
import {DeleteDialogComponent} from '../../shared-dialogs/delete/delete-dialog.component'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../shared-dialogs/dialog.mode'
import {CreateUpdateDialogComponent, FormOutputData, FormPayload} from '../../shared-dialogs/create-update/create-update-dialog.component'
import {FormInputString} from '../../shared-dialogs/forms/form.input.string'
import {FormInputBoolean} from '../../shared-dialogs/forms/form.input.boolean'
import {FormInputNumber} from '../../shared-dialogs/forms/form.input.number'
import {withCreateProtocol} from '../../models/protocol.model'
import {switchMap, tap} from 'rxjs/operators'

@Component({
    selector: 'lwm-assignment-plan',
    templateUrl: './assignment-plan.component.html',
    styleUrls: ['./assignment-plan.component.scss']
})
export class AssignmentPlanComponent implements OnInit, OnDestroy {

    @Input() labwork: LabworkAtom

    private headerTitle: String
    private subs: Subscription[]
    private dataSource = new MatTableDataSource<AssignmentEntry>()
    private plan: Readonly<AssignmentPlan>

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]

    private readonly certFcName = 'certificate'
    private readonly suppFcName = 'supplement'
    private readonly bonusFcName = 'bonus'

    constructor(
        private readonly assignmentPlanService: AssignmentPlanService,
        private readonly dialog: MatDialog
    ) {
        this.columns = [
            {title: 'Termin', attr: 'index'},
            {title: 'Bezeichnung', attr: 'label'},
            {title: 'Abnahmearten', attr: 'entryTypes'},
            {title: 'Folgetermin', attr: 'duration'},
        ]

        this.subs = []
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
    }

    ngOnInit() {
        console.log('plan loaded with ', this.labwork)
        this.headerTitle = `Ablaufplan für ${this.labwork.label}`

        this.fetchAssignmentPlan(this.updateDataSource)
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private fetchAssignmentPlan = (completion: (p: AssignmentPlan) => void) => {
        const s = subscribe(
            this.assignmentPlanService.getAllWithFilter(this.labwork.course.id, {attribute: 'labwork', value: this.labwork.id}),
            plans => {
                const plan = plans.shift()

                if (plan) {
                    completion(plan)
                }
            }
        )

        this.subs.push(s)
    }

    private updateDataSource = (plan: AssignmentPlan) => {
        this.plan = plan
        this.dataSource.data = plan.entries
            .sort((lhs, rhs) => lhs.index - rhs.index)
    }

    private onCreate = () => {
        const payload = this.formPayload(DialogMode.create, this.preFilledAssignmentEntry())
        const s = subscribe(this.openDialog(payload, this.create$).pipe(tap(console.log)), this.updateDataSource)

        this.subs.push(s)
    }

    private onEdit = (entry: AssignmentEntry) => {
        const payload = this.formPayload(DialogMode.edit, {...entry})
        const s = subscribe(this.openDialog(payload, this.update$), this.updateDataSource)

        this.subs.push(s)
    }

    private onDelete = (entry: AssignmentEntry) => {
        const dialogData = {label: `${entry.index + 1}. ${entry.label}`, id: entry.index.toString()}
        const dialogRef = DeleteDialogComponent.instance(this.dialog, dialogData)

        const s = subscribe(
            dialogRef.afterClosed(),
            _ => {
                const s1 = subscribe(
                    this.remove$(entry),
                    this.updateDataSource
                )

                this.subs.push(s1)
            }
        )

        this.subs.push(s)
    }

    private remove$ = (entry: AssignmentEntry): Observable<AssignmentPlan> => {
        const updatedEntries = this.plan.entries
            .filter(e => e.index !== entry.index)
            .map((e, i) => ({...e, index: i}))

        const body = {...this.plan, entries: updatedEntries}
        return this.assignmentPlanService.update(this.labwork.course.id, this.plan.id, body)
    }

    private create$ = (entry: AssignmentEntry): Observable<AssignmentPlan> => {
        const updatedEntries = this.plan.entries
            .concat(entry)

        const body = {...this.plan, entries: updatedEntries}
        return this.assignmentPlanService.update(this.labwork.course.id, this.plan.id, body)
    }

    private update$ = (entry: AssignmentEntry): Observable<AssignmentPlan> => {
        const updatedEntries = this.plan.entries
            .map(e => e.index === entry.index ? entry : e)

        const body = {...this.plan, entries: updatedEntries}
        return this.assignmentPlanService.update(this.labwork.course.id, this.plan.id, body)
    }

    private canCreate = (): boolean => {
        return true // TODO permission check
    }

    private canEdit = (): boolean => {
        return true // TODO permission check
    }

    private canDelete = (): boolean => {
        return true // TODO permission check
    }

    private displayedEntryTypes = (entry: AssignmentEntry): string[] => {
        return sortedAssignmentPlanEntryTypes(entry).types
            .map(t => t.entryType === AssignmentEntryTypeValue.bonus ? `${t.entryType} (${t.int})` : t.entryType)
    }

    // TODO use this abstraction everywhere
    private openDialog = <U>(payload: FormPayload<AssignmentEntry>, andThen: (e: AssignmentEntry) => Observable<U>): Observable<U> => {
        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)
        return dialogRef.afterClosed().pipe(switchMap(x => x ? andThen(x) : EMPTY))
    }

    private formPayload = (mode: DialogMode, entry: AssignmentEntry): FormPayload<AssignmentEntry> => {
        const inputData = this.formInputData(entry)

        return {
            headerTitle: dialogTitle(mode, `Eintrag ${entry.index + 1}`),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData,
            makeProtocol: updatedValues => mode === DialogMode.edit ?
                this.makeUpdateProtocol(updatedValues, entry) :
                this.makeCreateProtocol(updatedValues, entry),
        }
    }

    private formInputData = (entry: AssignmentEntry) => {
        return [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung',
                isDisabled: false,
                data: new FormInputString(entry.label)
            },
            {
                formControlName: this.certFcName,
                displayTitle: 'Testat',
                isDisabled: false,
                data: new FormInputBoolean(foldUndefined(
                    findEntryTypeValue(entry.types, AssignmentEntryTypeValue.certificate),
                    t => t.bool,
                    () => false)
                )
            },
            {
                formControlName: this.bonusFcName,
                displayTitle: 'Bonusleistung',
                isDisabled: false,
                data: new FormInputNumber(foldUndefined(
                    findEntryTypeValue(entry.types, AssignmentEntryTypeValue.bonus),
                    t => t.int,
                    () => 0)
                )
            },
            {
                formControlName: this.suppFcName,
                displayTitle: 'Zusatzleistung',
                isDisabled: false,
                data: new FormInputBoolean(foldUndefined(
                    findEntryTypeValue(entry.types, AssignmentEntryTypeValue.supplement),
                    t => t.bool,
                    () => false)
                )
            },
            {
                formControlName: 'duration',
                displayTitle: 'Gruppenrotation',
                isDisabled: false,
                data: new FormInputNumber(entry.duration)
            }
        ]
    }

    private makeCreateProtocol = (output: FormOutputData[], empty: AssignmentEntry): AssignmentEntry => {
        return withCreateProtocol(output, empty, p => {
            const bonusNumber = parseUnsafeNumber(p[this.bonusFcName])

            if (bonusNumber > 0) {
                p.types.push(this.bonusType(bonusNumber))
            }

            if (parseUnsafeBoolean(p[this.certFcName])) {
                p.types.push(this.certType())
            }

            if (parseUnsafeBoolean(p[this.suppFcName])) {
                p.types.push(this.suppType())
            }
        })
    }

    private makeUpdateProtocol = (output: FormOutputData[], empty: AssignmentEntry): AssignmentEntry => {
        const updateBonusIfNeeded = (e: AssignmentEntry) => {
            const bonusNumber = parseUnsafeNumber(e[this.bonusFcName])
            const maybeBonus = findEntryTypeValue(e.types, AssignmentEntryTypeValue.bonus)
            if (maybeBonus) {
                if (bonusNumber > 0) {
                    maybeBonus.int = bonusNumber
                } else {
                    e.types = e.types.filter(t => t !== maybeBonus)
                }
            } else {
                if (bonusNumber > 0) {
                    e.types.push(this.bonusType(bonusNumber))
                }
            }
        }

        const updateBooleanIfNeeded = (value: AssignmentEntryTypeValue, e: AssignmentEntry) => {
            let fcName
            let type

            switch (value) {
                case AssignmentEntryTypeValue.certificate:
                    fcName = this.certFcName
                    type = this.certType()
                    break
                case AssignmentEntryTypeValue.supplement:
                    fcName = this.suppFcName
                    type = this.suppType()
                    break
                default:
                    return
            }

            const bool = parseUnsafeBoolean(e[fcName])
            const maybeValue = findEntryTypeValue(e.types, value)

            if (maybeValue && !bool) {
                e.types = e.types.filter(t => t !== maybeValue)
            } else if (bool) {
                e.types.push(type)
            }
        }

        return withCreateProtocol(output, empty, p => {
            updateBonusIfNeeded(p)
            updateBooleanIfNeeded(AssignmentEntryTypeValue.certificate, p)
            updateBooleanIfNeeded(AssignmentEntryTypeValue.supplement, p)
        })
    }

    private preFilledAssignmentEntry = (): AssignmentEntry => {
        return {label: '', duration: 1, index: this.plan.entries.length, types: [this.attendanceType()]}
    }

    private attendanceType = (): AssignmentEntryType => {
        return {entryType: AssignmentEntryTypeValue.attendance, bool: true, int: 0}
    }

    private certType = (): AssignmentEntryType => {
        return {entryType: AssignmentEntryTypeValue.certificate, bool: true, int: 0}
    }

    private suppType = (): AssignmentEntryType => {
        return {entryType: AssignmentEntryTypeValue.supplement, bool: true, int: 0}
    }

    private bonusType = (int: number): AssignmentEntryType => {
        return {entryType: AssignmentEntryTypeValue.bonus, bool: true, int: int}
    }
}
