import {Component, OnInit} from '@angular/core'
import {fetchStudentSearchDashboard, LabworkContent, StudentSearchDashboard} from './students-view-model'
import {HttpService} from '../services/http.service'
import {ActivatedRoute} from '@angular/router'
import {map, switchMap} from 'rxjs/operators'
import {EMPTY, Observable} from 'rxjs'
import {SemesterJSON} from '../models/semester.model'
import {ReportCardTableEntry, ReportCardTableModel} from '../report-card-table/report-card-table.component'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {MatTableDataSource} from '@angular/material/table'
import {distinctEntryTypeColumns} from '../report-card-table/report-card-table-utils'
import {convertManyReportCardRescheduledAtomJSON, mapReportCardEntryAtomJSON} from '../utils/http-utils'
import {LabworkAtomJSON} from '../models/labwork.model'
import {userAuths} from '../security/user-authority-resolver'
import {AuthorityAtom} from '../models/authority.model'
import {ReportCardEntryAtom, ReportCardEntryType} from '../models/report-card-entry.model'
import {format, formatTime} from '../utils/lwmdate-adapter'

class DataSource {
    dataSources: {
        [id: string]: ReportCardTableModel
    }

    constructor() {
        this.clear()
    }

    clear = () =>
        this.dataSources = {}

    private uniqueIdentifier = (labwork: LabworkContent) =>
        labwork.labwork.id

    get = (labwork: LabworkContent): ReportCardTableModel =>
        this.dataSources[this.uniqueIdentifier(labwork)]

    set = (labwork: LabworkContent, model: ReportCardTableModel) =>
        this.dataSources[this.uniqueIdentifier(labwork)] = model
}


@Component({
    selector: 'lwm-student-search',
    templateUrl: './student-search.component.html',
    styleUrls: ['./student-search.component.scss'],
    standalone: false
})
export class StudentSearchComponent implements OnInit {

    dashboard$: Observable<StudentSearchDashboard>
    dataSources: DataSource = new DataSource()
    readonly auths: AuthorityAtom[]

    private readonly basicColumns: TableHeaderColumn[] = [
        {attr: 'assignmentIndex', title: '#'},
        {attr: 'date', title: 'Datum'},
        {attr: 'start', title: 'Start'},
        {attr: 'end', title: 'Ende'},
        {attr: 'room.label', title: 'Raum'},
        {attr: 'label', title: 'Bezeichnung'},
    ]

    constructor(
        private readonly http: HttpService,
        private readonly route: ActivatedRoute,
    ) {
        this.auths = userAuths(route)
    }

    ngOnInit(): void {
        this.dashboard$ = this.route.paramMap.pipe(
            switchMap(params => {
                const sid = params.get('sid')
                return sid && fetchStudentSearchDashboard(this.http, sid) || EMPTY
            }),
            map(this.prepareForUI)
        )
    }

    private prepareForUI = (dashboard: StudentSearchDashboard): StudentSearchDashboard => {
        const sortCourses = () =>
            dashboard.courses.sort((a, b) => {
                const lhs = a.labworks.some(_ => this.isCurrentSemester(dashboard.semester, _))
                const rhs = b.labworks.some(_ => this.isCurrentSemester(dashboard.semester, _))
                return lhs ? -1 : rhs ? 1 : 0
            })

        this.dataSources.clear() // reset data source

        return {
            ...dashboard,
            courses: sortCourses()
        }
    }

    expandIfCurrentSemester = (current: SemesterJSON, labwork: LabworkContent): boolean => {
        if (this.isCurrentSemester(current, labwork)) {
            this.bindDataSource(labwork)
            return true
        } else {
            return false
        }
    }

    bindDataSource = (labwork: LabworkContent) => {
        if (this.dataSources.get(labwork)) {
            return
        }

        const entryTypes: ReportCardEntryType[] = []

        const tableEntries: ReportCardTableEntry[] =
            labwork.reportCardEntries.map(({reportCardEntry, annotations, reschedules}) => {
                entryTypes.push(...reportCardEntry.entryTypes)
                return {
                    entry: mapReportCardEntryAtomJSON(reportCardEntry),
                    annotationCount: annotations.length,
                    reschedules: convertManyReportCardRescheduledAtomJSON(reschedules)
                }
            })

        this.dataSources.set(
            labwork,
            {
                dataSource: new MatTableDataSource(tableEntries),
                columns: this.basicColumns.concat(distinctEntryTypeColumns(entryTypes))
            })
    }

    panelTitle = (labwork: LabworkAtomJSON) =>
        `${labwork.label} - ${labwork.semester.abbreviation}`

    panelSubTitle = (labwork: LabworkContent) => {
        return ''
        // if (fastForwarded(labwork.evals)) {
        //     return 'Praktikum bestanden (vorzeitig anerkannt)'
        // }
        //
        // if (fired(labwork.evals)) {
        //     return 'Praktikum nicht bestanden (vorzeitig durchgefallen)'
        // }
        //
        // let passed = true
        // let details = ''
        //
        // labwork.evals.forEach(e => {
        //     passed = passed && e.bool
        //     details += `${e.label}: ${e.int}, `
        // })
        //
        // if (labwork.evals.length === 0) {
        //     return 'Keine Auswertung vorhanden'
        // }
        //
        // details = details.slice(0, -2)
        //
        // const oldApi = labwork.evals.every(e => e.int === 0)
        //
        // if (passed) {
        //     return oldApi ? 'Praktikum bestanden' : `Praktikum bestanden (${details})`
        // } else {
        //     return oldApi ? 'Praktikum nicht bestanden' : `Praktikum nicht bestanden (${details})`
        // }
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

    private isCurrentSemester = (current: SemesterJSON, c: LabworkContent) =>
        c.labwork.semester.id === current.id
}
