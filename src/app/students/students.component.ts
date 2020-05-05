import {Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {forkJoin, Observable, zip} from 'rxjs'
import {map, switchMap, tap} from 'rxjs/operators'
import {ReportCardEntryAtom} from '../models/report-card-entry.model'
import {User} from '../models/user.model'
import {userAuths} from '../security/user-authority-resolver'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {reportCardEntriesByCourseAndStudent$} from './students-view-model'
import {_groupBy, compose, dateOrderingDESC, first, nonEmpty} from '../utils/functions'
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

interface ReportCardsByLabwork {
    labwork: LabworkAtom,
    reportCardEntries: ReportCardEntryAtom[]
}

interface ReportCardsByCourse {
    course: CourseAtom,
    reportCardEntries: ReportCardsByLabwork[]
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

    private uniqueIdentifier = (entry: ReportCardsByLabwork) =>
        entry.labwork.id + first(entry.reportCardEntries)?.student?.id ?? ''

    get = (entry: ReportCardsByLabwork): ReportCardTableModel =>
        this.dataSources[this.uniqueIdentifier(entry)]

    set = (entry: ReportCardsByLabwork, model: ReportCardTableModel) =>
        this.dataSources[this.uniqueIdentifier(entry)] = model
}

@Component({
    selector: 'lwm-students',
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

    cardsByCourse$: Observable<ReportCardsByCourse[]>
    student$: Observable<User>
    private canReschedule: boolean

    constructor(
        private readonly route: ActivatedRoute,
        private readonly service: ReportCardEntryService,
        private readonly userService: UserService,
        private readonly labworkService: LabworkService,
    ) {
        this.dataSources = new DataSource()
        this.canReschedule = false
    }

    formatUser = formatUser

    private dataSources: DataSource

    ngOnInit() {
        this.fetchReportCardEntries(this.auths().filter(x => x.course !== undefined))
    }

    auths = () => userAuths(this.route)

    private fetchReportCardEntries = (courseRelatedAuths: Readonly<AuthorityAtom[]>) => {
        const groupByCourse = (xs: [ReportCardEntryAtom[], LabworkAtom[]][]): ReportCardsByCourse[] =>
            xs.map(([r, l]) => {
                const course = l[0].course
                const reportCardEntries = Object.entries(_groupBy(r, _ => _.labwork.id)).map(x => {
                    const labwork = l.find(_ => _.id === x[0])!
                    const entries = x[1] as ReportCardEntryAtom[]

                    return {
                        labwork: labwork,
                        reportCardEntries: entries.sort((a, b) => a.assignmentIndex - b.assignmentIndex)
                    }
                })

                return {
                    course: course,
                    reportCardEntries: reportCardEntries
                }
            })

        const reportCardsWithLaworks$ = (student: User) =>
            courseRelatedAuths.map(_ => {
                return zip(
                    // tslint:disable-next-line:no-non-null-assertion
                    reportCardEntriesByCourseAndStudent$(this.service, _.course!.id, student.id),
                    this.labworkService.getAll(_.course!.id)
                )
            })

        const filterNonEmpty = (xs: ReportCardsByCourse[]) =>
            xs.filter(x => nonEmpty(x.reportCardEntries))

        this.student$ = this.route.paramMap.pipe(
            // tslint:disable-next-line:no-non-null-assertion
            switchMap(params => this.userService.get(params.get('sid')!)),
            tap(student => {
                this.dataSources.clear()
                this.cardsByCourse$ = forkJoin(reportCardsWithLaworks$(student)).pipe(
                    map(compose(groupByCourse, filterNonEmpty))
                )
            })
        )
    }

    bindDataSource = (entry: ReportCardsByLabwork) => {
        const basicColumns = (): TableHeaderColumn[] => [
            {attr: 'assignmentIndex', title: '#'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'room.label', title: 'Raum'},
            {attr: 'label', title: 'Bezeichnung'},
        ]

        if (!this.dataSources.get(entry)) {
            this.dataSources.set(entry, {
                dataSource: new MatTableDataSource<ReportCardEntryAtom>(entry.reportCardEntries),
                columns: basicColumns().concat(distinctEntryTypeColumns(entry.reportCardEntries.flatMap(_ => _.entryTypes)))
            })
        }
    }

    accordionTitle = (labwork: LabworkAtom) =>
        `${labwork.label} - ${labwork.semester.abbreviation}`

    sortByCourse = () => (a: ReportCardsByCourse, b: ReportCardsByCourse) =>
        a.course.abbreviation.localeCompare(b.course.abbreviation)

    sortBySemester = () => (a: ReportCardsByLabwork, b: ReportCardsByLabwork) =>
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

    enrollment = (user: User): string | undefined =>
        isStudentAtom(user) ? user.enrollment.label : undefined

    mail = (user: User): string =>
        `mailto:${user.email}`
}
