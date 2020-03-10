import {Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {forkJoin, Observable, zip} from 'rxjs'
import {map, switchMap, tap} from 'rxjs/operators'
import {ReportCardEntryAtom, ReportCardEntryType} from '../models/report-card-entry.model'
import {User} from '../models/user.model'
import {userAuths} from '../security/user-authority-resolver'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {reportCardEntriesByCourseAndStudent$} from './students-view-model'
import {_groupBy, compose, dateOrderingDESC, nonEmpty} from '../utils/functions'
import {LabworkService} from '../services/labwork.service'
import {CourseAtom} from '../models/course.model'
import {LabworkAtom} from '../models/labwork.model'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {MatTableDataSource} from '@angular/material'
import {AuthorityAtom} from '../models/authority.model'
import {hasAnyRole} from '../utils/role-checker'
import {UserRole} from '../models/role.model'
import {LWMActionType, rescheduleAction} from '../table-action-button/lwm-actions'
import {assignmentEntryTypeSortingF, AssignmentEntryTypeValue, stringToAssignmentEntryTypeValue} from '../models/assignment-plan.model'

interface ReportCardsByLabwork {
    labwork: LabworkAtom,
    reportCardEntries: ReportCardEntryAtom[]
}

interface ReportCardsByCourse {
    course: CourseAtom,
    reportCardEntries: ReportCardsByLabwork[]
}

interface TableModel {
    dataSource: MatTableDataSource<ReportCardEntryAtom>,
    columns: TableHeaderColumn[]
}

@Component({
    selector: 'lwm-students',
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

    private cardsByCourse$: Observable<ReportCardsByCourse[]>
    private student$: Observable<User>
    private canReschedule: boolean

    constructor(
        private readonly route: ActivatedRoute,
        private readonly service: ReportCardEntryService,
        private readonly userService: UserService,
        private readonly labworkService: LabworkService,
    ) {
        this.dataSources = {}
        this.canReschedule = false
    }

    private formatUser_ = formatUser

    private dataSources: {
        [id: string]: TableModel
    }

    ngOnInit() {
        const auths = userAuths(this.route)

        this.canReschedule = this.hasReschedulePermission(auths)
        this.fetchReportCardEntries(auths.filter(x => x.course !== undefined))
    }

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
                this.cardsByCourse$ = forkJoin(reportCardsWithLaworks$(student)).pipe(
                    map(compose(groupByCourse, filterNonEmpty))
                )
            })
        )
    }

    private hasReschedulePermission = (auths: AuthorityAtom[]) =>
        hasAnyRole(auths, UserRole.courseEmployee, UserRole.courseManager, UserRole.admin)

    private bindDataSource = (entry: ReportCardsByLabwork) => {
        const basicColumns = (): TableHeaderColumn[] => [
            {attr: 'assignmentIndex', title: '#'},
            {attr: 'date', title: 'Datum'},
            {attr: 'start', title: 'Start'},
            {attr: 'end', title: 'Ende'},
            {attr: 'room.label', title: 'Raum'},
            {attr: 'label', title: 'Bezeichnung'},
        ]

        const entryTypeColumns = (types: ReportCardEntryType[]): TableHeaderColumn[] => {
            const distinctEntryTypes = () => {
                const entryTypes = new Set<AssignmentEntryTypeValue>()

                types.forEach(t => {
                    const x = stringToAssignmentEntryTypeValue(t.entryType)
                    if (x) {
                        entryTypes.add(x)
                    }
                })

                return entryTypes
            }

            return Array
                .from(distinctEntryTypes())
                .sort(assignmentEntryTypeSortingF)
                .map(x => ({attr: x, title: x}))
        }

        if (!this.dataSources[entry.labwork.id]) {
            this.dataSources[entry.labwork.id] = {
                dataSource: new MatTableDataSource<ReportCardEntryAtom>(entry.reportCardEntries),
                columns: basicColumns().concat(entryTypeColumns(entry.reportCardEntries.flatMap(_ => _.entryTypes)))
            }
        }
    }

    private tableModelFor = (entry: ReportCardsByLabwork): TableModel =>
        this.dataSources[entry.labwork.id]


    private accordionTitle = (labwork: LabworkAtom) =>
        `${labwork.label} - ${labwork.semester.abbreviation}`

    private sortByCourse = () => (a: ReportCardsByCourse, b: ReportCardsByCourse) =>
        a.course.abbreviation.localeCompare(b.course.abbreviation)

    private sortBySemester = () => (a: ReportCardsByLabwork, b: ReportCardsByLabwork) =>
        dateOrderingDESC(a.labwork.semester.start, b.labwork.semester.start)

    private rescheduleAction = () => [rescheduleAction()]

    private reschedule = (args: { actionType: LWMActionType; e: ReportCardEntryAtom }) => {
        console.log(args.actionType, args.e)
    }
}
