import {Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {EMPTY, Observable, of} from 'rxjs'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {switchMap} from 'rxjs/operators'
import {TableHeaderColumn} from '../../../abstract-crud/abstract-crud.component'
import {MatTableDataSource} from '@angular/material'
import {distinctEntryTypeColumns} from '../../../report-card-table/report-card-table-utils'
import {format, formatTime} from '../../../utils/lwmdate-adapter'
import {ReportCardTableModel, ReschedulePresentationStrategy} from '../../../report-card-table/report-card-table.component'
import {defaultStudentReschedulePresentationStrategy} from '../../../student-search/students-view-model'

@Component({
    selector: 'lwm-student-report-card',
    templateUrl: './student-report-card.component.html',
    styleUrls: ['./student-report-card.component.scss']
})
export class StudentReportCardComponent implements OnInit {

    cards$: Observable<ReportCardEntryAtom[]>
    readonly reschedulePresentationStrategy: ReschedulePresentationStrategy

    constructor(
        private readonly route: ActivatedRoute,
        private readonly service: ReportCardEntryService
    ) {
        this.cards$ = route.paramMap.pipe(
            switchMap(map => {
                const labwork = map.get('lid')
                const student = map.get('sid')

                return labwork && student ? of([labwork, student]) : EMPTY
            }),
            switchMap(([labwork, student]) => service.fromStudent(student, labwork))
        )
        this.reschedulePresentationStrategy = defaultStudentReschedulePresentationStrategy()
    }

    ngOnInit(): void {
    }

    headerTitle = (card: ReportCardEntryAtom) =>
        `Notenheft für ${card.labwork.label}`

    tableModelFor = (cards: ReportCardEntryAtom[]): ReportCardTableModel => {
        const basicColumns = (): TableHeaderColumn[] => [
            {attr: 'assignmentIndex', title: '#'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'room.label', title: 'Raum'},
            {attr: 'label', title: 'Bezeichnung'},
        ]

        return {
            dataSource: new MatTableDataSource(
                cards
                    .sort((a, b) => a.assignmentIndex - b.assignmentIndex)
                    .map(e => ({entry: e, annotationCount: 0})) // TODO
            ),
            columns: basicColumns().concat(distinctEntryTypeColumns(cards.flatMap(_ => _.entryTypes)))
        }
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
}
