import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {LabworkAtom} from '../../models/labwork.model'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {AssignmentEntry, AssignmentEntryTypeValue, AssignmentPlan, sortedAssignmentPlanEntryTypes} from '../../models/assignment-plan.model'
import {AssignmentPlanService} from '../../services/assignment-plan.service'
import {subscribe} from '../../utils/functions'
import {DeleteDialogComponent} from '../../shared-dialogs/delete/delete-dialog.component'

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
    private plan: AssignmentPlan

    private readonly displayedColumns: string[]
    private readonly columns: TableHeaderColumn[]

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

    }

    private onEdit = (entry: AssignmentEntry) => {

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

    private canCreate = (): boolean => {
        return true // TODO permission check
    }

    private canEdit = (): boolean => {
        return true // TODO permission check
    }

    private canDelete = (): boolean => {
        return true // TODO permission check
    }

    private displayEntryTypes = (entry: AssignmentEntry): string => {
        return this.displayedEntryTypes(entry)
            .join(', ')
    }

    private displayedEntryTypes = (entry: AssignmentEntry): string[] => {
        return sortedAssignmentPlanEntryTypes(entry).types
            .map(t => t.entryType === AssignmentEntryTypeValue.bonus ? `${t.entryType} (${t.int})` : t.entryType)
    }
}
