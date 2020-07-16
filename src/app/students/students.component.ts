import {Component, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {EMPTY, forkJoin, Observable, of, Subscription, zip} from 'rxjs'
import {map, switchMap, tap} from 'rxjs/operators'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {StudentAtom} from '../models/user.model'
import {userAuths} from '../security/user-authority-resolver'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {reportCardEntriesByCourseAndStudent$} from './students-view-model'
import {_groupBy, compose, count, dateOrderingDESC, nonEmpty, subscribe} from '../utils/functions'
import {LabworkService} from '../services/labwork.service'
import {CourseAtom} from '../models/course.model'
import {LabworkAtom} from '../models/labwork.model'
import {MatTableDataSource} from '@angular/material'
import {AuthorityAtom} from '../models/authority.model'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {distinctEntryTypeColumns} from '../report-card-table/report-card-table-utils'
import {ReportCardTableModel} from '../report-card-table/report-card-table.component'
import {format, formatTime} from '../utils/lwmdate-adapter'
import {isStudentAtom} from '../utils/type.check.utils'
import {SemesterService} from '../services/semester.service'
import {Semester} from '../models/semester.model'
import {EntryType} from '../models/assignment-plan.model'
import {dropLast} from '../utils/string-utils'

export interface PanelViewModel {
    labwork: LabworkAtom,
    reportCardEntries: ReportCardEntryAtom[]
    title: string
    subTitle: string
    isCurrentSemester: boolean
}

export interface AccordionViewModel {
    course: CourseAtom,
    panels: PanelViewModel[]
}

export interface StudentViewModel {
    title: string
    mailto: string
    mailAddress: string
    enrollmentLabel: string
}

class DataSource {
    private dataSources: {
        [id: string]: ReportCardTableModel
    }

    constructor() {
        this.clear()
    }

    clear = () =>
        this.dataSources = {}

    private uniqueIdentifier = (entry: PanelViewModel) =>
        entry.labwork.id

    get = (entry: PanelViewModel): ReportCardTableModel =>
        this.dataSources[this.uniqueIdentifier(entry)]

    set = (entry: PanelViewModel, model: ReportCardTableModel) =>
        this.dataSources[this.uniqueIdentifier(entry)] = model
}

@Component({
    selector: 'lwm-students',
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {

    constructor(
        private readonly route: ActivatedRoute,
        private readonly service: ReportCardEntryService,
        private readonly userService: UserService,
        private readonly labworkService: LabworkService,
        private readonly semesterService: SemesterService
    ) {
        this.auths = userAuths(route)
        this.dataSources = new DataSource()
        this.canReschedule = false
    }

    accordions$: Observable<AccordionViewModel[]>
    student$: Observable<StudentViewModel>
    canReschedule: boolean

    currentSemester: Semester
    auths: AuthorityAtom[] = []
    dataSources: DataSource

    private sub: Subscription

    ngOnInit() {
        this.fetchReportCardEntries(this.auths.filter(x => x.course !== undefined))
        this.fetchCurrentSemester()
    }

    ngOnDestroy() {
        this.sub.unsubscribe()
    }

    private fetchCurrentSemester = () => {
        this.sub = subscribe(this.semesterService.current(), s => {
            this.currentSemester = s
        })
    }

    private fetchReportCardEntries = (courseRelatedAuths: Readonly<AuthorityAtom[]>) => {
        this.student$ = this.route.paramMap.pipe(
            // tslint:disable-next-line:no-non-null-assertion
            switchMap(params => this.userService.get(params.get('sid')!)),
            switchMap(s => isStudentAtom(s) ? of(s) : EMPTY),
            tap(s => this.onNewStudentLoaded(s, courseRelatedAuths)),
            map(s => ({title: formatUser(s), mailto: `mailto:${s.email}`, mailAddress: s.email, enrollmentLabel: s.enrollment.label}))
        )
    }

    // This function is called if a new student is search. Use this to reset state and fetch new data
    private onNewStudentLoaded = (student: StudentAtom, courseRelatedAuths: Readonly<AuthorityAtom[]>) => {
        const makeAccordions = (xs: [ReportCardEntryAtom[], LabworkAtom[]][]): AccordionViewModel[] =>
            xs.map(([r, l]) => {
                const course = l[0].course
                const reportCardEntries: PanelViewModel[] = Object.entries(_groupBy(r, _ => _.labwork.id)).map(x => {
                    const labwork = l.find(_ => _.id === x[0])!
                    const entries = x[1] as ReportCardEntryAtom[]

                    return {
                        labwork: labwork,
                        reportCardEntries: entries.sort((a, b) => a.assignmentIndex - b.assignmentIndex),
                        title: this.panelTitle(labwork),
                        subTitle: this.panelSubTitle(entries),
                        isCurrentSemester: this.isCurrentSemester(labwork)
                    }
                })

                return {
                    course: course,
                    panels: reportCardEntries,
                }
            })

        const reportCardsWithLaworks$ = () =>
            courseRelatedAuths.map(_ => {
                return zip(
                    // tslint:disable-next-line:no-non-null-assertion
                    reportCardEntriesByCourseAndStudent$(this.service, _.course!.id, student.id),
                    this.labworkService.getAll(_.course!.id)
                )
            })

        const filterNonEmpty = (xs: AccordionViewModel[]) =>
            xs.filter(x => nonEmpty(x.panels))

        this.dataSources.clear()
        // forkJoin maps Obserable<A>[] to Observable<A[]>
        this.accordions$ = forkJoin(reportCardsWithLaworks$()).pipe(
            map(compose(makeAccordions, filterNonEmpty))
        )
    }

    private panelTitle = (labwork: LabworkAtom): string =>
        `${labwork.label} - ${labwork.semester.abbreviation}`

    // TODO: Better use evals to determine if someone has passed or not
    private panelSubTitle = (reportCardEntries: ReportCardEntryAtom[]): string => {
        const atts: (boolean | undefined)[] = []
        const certs: (boolean | undefined)[] = []
        const sups: (boolean | undefined)[] = []
        let bonus = 0

        reportCardEntries.forEach(e => {
            e.entryTypes.forEach(t => {
                switch (t.entryType) {
                    case 'Anwesenheitspflichtig':
                        atts.push(t.bool)
                        break
                    case 'Testat':
                        certs.push(t.bool)
                        break
                    case 'Zusatzleistung':
                        sups.push(t.bool)
                        break
                    case 'Bonus':
                        bonus += t.int
                        break
                }
            })
        })

        const xs: [EntryType, number][] = [
            ['Anwesenheitspflichtig', count(atts, _ => _ ?? false)],
            ['Testat', count(certs, _ => _ ?? false)],
            ['Zusatzleistung', count(sups, _ => _ ?? false)],
            ['Bonus', bonus]
        ]

        if (xs.every(_ => _[1] === 0)) {
            return 'Nicht Bestanden'

        }

        const string = xs.reduce(
            (acc, [entryType, n]) => {
                if (n === 0) {
                    return acc
                }
                return `${acc}${entryType}: ${n}, `
            },
            ''
        )

        return dropLast(2, string)
    }

    private isCurrentSemester = (labwork: LabworkAtom): boolean =>
        labwork.semester.id === this.currentSemester.id

    bindDataSource = (p: PanelViewModel) => {
        const basicColumns = (): TableHeaderColumn[] => [
            {attr: 'assignmentIndex', title: '#'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'room.label', title: 'Raum'},
            {attr: 'label', title: 'Bezeichnung'},
        ]

        if (!this.dataSources.get(p)) {
            this.dataSources.set(p, {
                dataSource: new MatTableDataSource<ReportCardEntryAtom>(p.reportCardEntries),
                columns: basicColumns().concat(distinctEntryTypeColumns(p.reportCardEntries.flatMap(_ => _.entryTypes)))
            })
        }
    }

    sortAccordions = (a: AccordionViewModel, b: AccordionViewModel): number => {
        const lhs = a.panels.some(_ => this.isCurrentSemester(_.labwork))
        const rhs = b.panels.some(_ => this.isCurrentSemester(_.labwork))

        return lhs ? -1 : rhs ? 1 : 0
    }

    sortPanels = (a: PanelViewModel, b: PanelViewModel): number =>
        dateOrderingDESC(a.labwork.semester.start, b.labwork.semester.start)

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

    expandIfCurrentSemester = (p: PanelViewModel): boolean => {
        if (p.isCurrentSemester) {
            this.bindDataSource(p)
            return true
        } else {
            return false
        }
    }
}
