import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {EMPTY, Subscription} from 'rxjs'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {switchMap} from 'rxjs/operators'
import {TableHeaderColumn} from '../../../abstract-crud/abstract-crud.component'
import {MatTableDataSource} from '@angular/material'
import {distinctEntryTypeColumns} from '../../../report-card-table/report-card-table-utils'
import {format, formatTime} from '../../../utils/lwmdate-adapter'
import {ReportCardTableModel} from '../../../report-card-table/report-card-table.component'
import {dateOrderingASC, subscribe} from '../../../utils/functions'
import {AnnotationService} from '../../../services/annotation.service'
import {AnnotationAtom} from '../../../models/annotation'
import {groupBy, mapMap} from '../../../utils/group-by'
import {fullUserName} from '../../../utils/component.utils'

interface LabworkView {
    title: string
}

interface AnnotationView {
    index: number
    label: string
    content: string[]
}

@Component({
    selector: 'lwm-student-report-card',
    templateUrl: './student-report-card.component.html',
    styleUrls: ['./student-report-card.component.scss']
})
export class StudentReportCardComponent implements OnInit, OnDestroy {

    tableModel: ReportCardTableModel
    annotationDataSource: MatTableDataSource<AnnotationView>
    labworkView: LabworkView
    displayedColumns: string[] = ['index', 'label', 'content']

    private subs: Subscription[] = []

    constructor(
        private readonly route: ActivatedRoute,
        private readonly reportCardEntryService: ReportCardEntryService,
        private readonly annotationService: AnnotationService,
    ) {
    }

    ngOnInit(): void {
        this.fetchReportCards(cards => this.fetchAnnotations(cards))
    }

    ngOnDestroy() {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private fetchReportCards = (completion: (cards: ReportCardEntryAtom[]) => void) => {
        this.subs.push(subscribe(
            this.route.paramMap.pipe(
                switchMap(map => {
                    const labwork = map.get('lid')
                    const student = map.get('sid')

                    return labwork && student ? this.reportCardEntryService.fromStudent(student, labwork) : EMPTY
                })
            ),
            cards => {
                this.updateReportCardEntryUI(cards)
                completion(cards)
            }
        ))
    }

    private fetchAnnotations = (cards: ReportCardEntryAtom[]) => {
        this.subs.push(subscribe(
            this.route.paramMap.pipe(
                switchMap(map => {
                    const labwork = map.get('lid')
                    return labwork ? this.annotationService.getForStudent(labwork) : EMPTY
                })
            ),
            this.updateAnnotationsUI(cards)
        ))
    }

    private updateReportCardEntryUI = (cards: ReportCardEntryAtom[]) => {
        const card = cards[0]

        this.labworkView = {
            title: `Praktikumsdaten zu ${card.labwork.label}`,
        }
        this.tableModel = this.makeTableModel(cards)
    }

    private updateAnnotationsUI = (cards: ReportCardEntryAtom[]): (annotations: AnnotationAtom[]) => void => annotations => {
        this.annotationDataSource = new MatTableDataSource<AnnotationView>(
            mapMap(
                groupBy(annotations, a => a.reportCardEntry),
                (k, v) => {
                    // tslint:disable-next-line:no-non-null-assertion
                    const card = cards.find(_ => _.id === k)!!
                    return {
                        index: card.assignmentIndex + 1,
                        label: card.label,
                        content: v
                            .sort((a, b) => dateOrderingASC(a.lastModified, b.lastModified))
                            .map(a => `${format(a.lastModified, 'dd.MM.yyyy - HH:mm')}: ${a.message} (${fullUserName(a.author)})`)
                    }
                }
            ).sort((a, b) => a.index - b.index)
        )
    }

    private makeTableModel = (cards: ReportCardEntryAtom[]): ReportCardTableModel => {
        const basicColumns: TableHeaderColumn[] = [
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
                    .map(e => ({entry: e, annotationCount: 0}))
            ),
            columns: basicColumns.concat(distinctEntryTypeColumns(cards.flatMap(_ => _.entryTypes)))
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
