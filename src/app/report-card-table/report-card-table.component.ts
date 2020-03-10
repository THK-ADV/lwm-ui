import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {exists, foldUndefined, nonEmpty} from '../utils/functions'
import {AssignmentEntryTypeValue, stringToAssignmentEntryTypeValue} from '../models/assignment-plan.model'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {LWMAction, LWMActionType} from '../table-action-button/lwm-actions'

@Component({
    selector: 'lwm-report-card-table',
    templateUrl: './report-card-table.component.html',
    styleUrls: ['./report-card-table.component.scss']
})
export class ReportCardTableComponent implements OnInit {

    @Input() dataSource: MatTableDataSource<ReportCardEntryAtom>
    @Input() columns: TableHeaderColumn[]
    @Input() actions: LWMAction[]

    @Output() actionEmitter: EventEmitter<{ actionType: LWMActionType, e: ReportCardEntryAtom }>

    constructor() {
        this.actionEmitter = new EventEmitter<{ actionType: LWMActionType, e: ReportCardEntryAtom }>()
    }

    ngOnInit() {

    }

    private hasReportCardEntryTypeValue = (e: ReportCardEntryAtom, type: string): boolean =>
        exists(e.entryTypes, _ => _.entryType === type)

    private reportCardEntryTypeValue = (e: ReportCardEntryAtom, type: string): number => {
        // force unwrapping is only allowed if hasReportCardEntryTypeValue is checked before.
        // this is a bad design, but there is no other way due to html restrictions
        // tslint:disable-next-line:no-non-null-assertion
        const lifedType = stringToAssignmentEntryTypeValue(type)!
        // tslint:disable-next-line:no-non-null-assertion
        const entryType = e.entryTypes.find(_ => _.entryType === lifedType)!

        switch (lifedType) {
            case AssignmentEntryTypeValue.attendance:
            case AssignmentEntryTypeValue.certificate:
            case AssignmentEntryTypeValue.supplement:
                return foldUndefined(entryType.bool, b => b ? 1 : 0, () => -1)
            case AssignmentEntryTypeValue.bonus:
                return entryType.int
        }
    }

    private tableContentFor = (e: ReportCardEntryAtom, attr: string) => {
        switch (attr) {
            case 'date':
                return format(e.date, 'dd.MM.yyyy')
            case 'start':
                return formatTime(e.start, 'HH:mm')
            case 'end':
                return formatTime(e.end, 'HH:mm')
            case 'assignmentIndex':
                return e.assignmentIndex + 1
            case 'room.label':
                return e.room.label
            default:
                return e[attr]
        }
    }

    private performAction = (actionType: LWMActionType, e: ReportCardEntryAtom) =>
        this.actionEmitter.emit({actionType: actionType, e: e})


    private displayedColumnsFor = () => {
        const c = this.columns.map(_ => _.attr)

        if (nonEmpty(this.actions)) {
            c.push('action')
        }

        return c
    }

}
