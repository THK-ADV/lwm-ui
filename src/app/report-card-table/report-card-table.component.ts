import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {nonEmpty} from '../utils/functions'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/old/old-abstract-crud.component'
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

    tableContentFor = (e: ReportCardEntryAtom, attr: string) => {
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

    performAction = (actionType: LWMActionType, e: ReportCardEntryAtom) =>
        this.actionEmitter.emit({actionType: actionType, e: e})


    displayedColumnsFor = () => {
        const c = this.columns.map(_ => _.attr)

        if (nonEmpty(this.actions)) {
            c.push('action')
        }

        return c
    }

}
