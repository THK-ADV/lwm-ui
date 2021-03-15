import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {ReportCardEntryService} from '../../../services/report-card-entry.service'
import {EMPTY, of, Subscription, zip} from 'rxjs'
import {ReportCardEntryAtom} from '../../../models/report-card-entry.model'
import {mergeAll, switchMap, toArray} from 'rxjs/operators'
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
import {RescheduleService} from '../../../services/reschedule.service'
import {ReportCardRescheduledAtom} from '../../../models/report-card-rescheduled.model'

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
        private readonly rescheduledService: RescheduleService,
    ) {
    }

    ngOnInit(): void {
        this.fetchReportCards(cards => {
            this.fetchReschedules(cards, res => this.updateReportCardEntryTableUI(res))
            this.fetchAnnotations(cards)
        })
    }

    ngOnDestroy() {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private fetchReschedules = (cards: ReportCardEntryAtom[], completion: (rs: [ReportCardEntryAtom, ReportCardRescheduledAtom[]][]) => void) => {
        this.subs.push(
            subscribe(
                of(cards).pipe(
                    switchMap(xs => xs.map(x => zip(of(x), this.rescheduledService.all(x.id)))),
                    mergeAll(),
                    toArray()
                ),
                rs => completion(rs)
            )
        )
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
                this.updateTitle(cards[0])
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

    private updateTitle = (card: ReportCardEntryAtom) =>
        this.labworkView = {
            title: `Praktikumsdaten zu ${card.labwork.label}`,
        }

    private updateReportCardEntryTableUI = (cards: [ReportCardEntryAtom, ReportCardRescheduledAtom[]][]) => {
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

    private makeTableModel = (cards: [ReportCardEntryAtom, ReportCardRescheduledAtom[]][]): ReportCardTableModel => {
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
                    .sort(([a], [b]) => a.assignmentIndex - b.assignmentIndex)
                    .map(([entry, reschedules]) => ({entry, reschedules, annotationCount: 0}))
            ),
            columns: basicColumns.concat(distinctEntryTypeColumns(cards.flatMap(([e]) => e.entryTypes)))
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
