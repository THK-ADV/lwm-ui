import {Component, OnInit, ViewChild} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {groupBy, map, mergeAll, switchMap, tap, toArray} from 'rxjs/operators'
import {CourseService} from '../services/course.service'
import {identity, merge, Observable, of, zip} from 'rxjs'
import {CourseAtom} from '../models/course.model'
import {LabworkAtom, LabworkService} from '../services/labwork.service'
import {SemesterService} from '../services/semester.service'
import {Semester} from '../models/semester.model'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {MatSort, MatTableDataSource, TooltipPosition} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {nestedObjectSortingDataAccessor} from '../utils/sort'

function _groupBy<T>(array: T[], key: (t: T) => string): { key: string, value: T[] } {
    // @ts-ignore
    return array.reduce((acc, x) => {
        const k = key(x)
        acc[k] = acc[k] || []
        acc[k].push(x)
        return acc
    }, {})
}

interface LabworkWithApplications {
    labwork: LabworkAtom
    semester: Semester
    applications: number
}

interface GroupedLabwork {
    key: string
    value: LabworkWithApplications[]
}

type LabworkActionType = 'edit' | 'delete' | 'schedule' | 'groups' | 'graduates' | 'applications'

interface LabworkAction {
    type: LabworkActionType
    color: LWMColor
    iconName: string
    tooltipName: string
    tooltipPosition: TooltipPosition
}

@Component({
    selector: 'app-course.detail',
    templateUrl: './labworks.component.html',
    styleUrls: ['./labworks.component.scss']
})
export class LabworksComponent implements OnInit {

    private readonly columns: TableHeaderColumn[] = [
        {attr: 'labwork.label', title: 'Bezeichnung'},
        {attr: 'applications', title: 'Anmeldungen'},
        {attr: 'labwork.subscribable', title: 'Anmeldbar'},
        {attr: 'labwork.published', title: 'Veröffentlicht'}
    ]

    private readonly labworkActions: LabworkAction[] = [
        {type: 'schedule', color: 'primary', iconName: 'schedule', tooltipName: 'Staffelplan', tooltipPosition: 'above'},
        {type: 'applications', color: 'accent', iconName: 'assignment_ind', tooltipName: 'Anmeldungen', tooltipPosition: 'above'},
        {type: 'groups', color: 'accent', iconName: 'group', tooltipName: 'Gruppen', tooltipPosition: 'above'},
        {type: 'graduates', color: 'accent', iconName: 'school', tooltipName: 'Absolventen', tooltipPosition: 'above'},
        {type: 'edit', color: 'accent', iconName: 'edit', tooltipName: 'Bearbeiten', tooltipPosition: 'above'},
        {type: 'delete', color: 'warn', iconName: 'delete', tooltipName: 'Löschen', tooltipPosition: 'above'},
    ]

    private course$: Observable<CourseAtom>
    private currentSemester$: Observable<Semester>
    private groupedLabworks$: Observable<GroupedLabwork>

    private readonly displayedColumns: string[]
    private readonly dataSource = new MatTableDataSource<LabworkWithApplications>()

    @ViewChild(MatSort, {static: false}) set matSort(ms: MatSort) { // MatSort is undefined if data is loaded asynchronously
        this.dataSource.sort = ms
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor
    }

    constructor(
        private route: ActivatedRoute,
        private courseService: CourseService,
        private semesterService: SemesterService,
        private labworkService: LabworkService,
        private labworkApplicationService: LabworkApplicationService
    ) {
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
    }

    ngOnInit() {
        this.currentSemester$ = this.semesterService.current()

        this.course$ = this.route.paramMap.pipe(
            switchMap(params => this.courseService.get(params.get('id') || '')),
            tap(course => {
                const labworksWithApps$ = this.labworkService.getAll(course.id).pipe(
                    switchMap(ls => {
                        return ls.map(l => zip(this.labworkApplicationService.getApplications(l.id).pipe(map(xs => xs.length)), of(l)))
                    }),
                    mergeAll(),
                    map(x => ({labwork: x[1], apps: x[0]})),
                    groupBy(z => z.labwork.semester),
                    switchMap(group => zip(group.pipe(map(identity)), of(group.key))),
                )

                this.groupedLabworks$ = merge(labworksWithApps$).pipe(
                    toArray(),
                    map(xs => xs.map(x => ({semester: x[1], labwork: x[0].labwork, applications: x[0].apps}))),
                    map(xs => _groupBy(xs, x => x.semester.id))
                )
            })
        )
    }

    private semesterSortingFn = (lhs: GroupedLabwork, rhs: GroupedLabwork): number => { // TODO this will break if abbreviation do not match the actual dates (e.g. CGA)
        return rhs.value[0].semester.abbreviation.localeCompare(lhs.value[0].semester.abbreviation)
    }

    private sumApplications = (lwas: LabworkWithApplications[]): number => {
        return lwas.reduce((acc, v) => acc + v.applications, 0)
    }

    reloadDataSource(lwas: LabworkWithApplications[]) {
        this.dataSource.data = lwas
    }

    onSelect(lwa: LabworkWithApplications) {
        console.log(lwa)
    }

    onAction(action: LabworkActionType, labwork: LabworkAtom) {
        console.log(action, labwork)
    }
}
