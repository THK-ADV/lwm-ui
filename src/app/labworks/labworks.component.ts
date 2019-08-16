import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {groupBy, map, mergeAll, switchMap, tap, toArray} from 'rxjs/operators'
import {CourseService} from '../services/course.service'
import {identity, merge, Observable, of, Subscription, zip} from 'rxjs'
import {CourseAtom} from '../models/course.model'
import {SemesterService} from '../services/semester.service'
import {Semester} from '../models/semester.model'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {MatDialog, MatSort, MatTableDataSource, TooltipPosition} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {LabworkService} from '../services/labwork.service'
import {Labwork, LabworkAtom, LabworkProtocol} from '../models/labwork.model'
import {AlertService} from '../services/alert.service'
import {_groupBy, NotImplementedError, subscribe} from '../utils/functions'
import {removeFromDataSource} from '../shared-dialogs/dataSource.update'
import {
    CreateUpdateDialogComponent,
    FormInputData,
    FormOutputData,
    FormPayload
} from '../shared-dialogs/create-update/create-update-dialog.component'
import {isUniqueEntity} from '../models/unique.entity.model'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {Validators} from '@angular/forms'
import {optionsValidator} from '../utils/form.validator'
import {withCreateProtocol} from '../models/protocol.model'

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
export class LabworksComponent implements OnInit, OnDestroy {

    private readonly columns: TableHeaderColumn[] = [
        {attr: 'labwork.label', title: 'Bezeichnung'},
        {attr: 'applications', title: 'Anmeldungen'},
        {attr: 'labwork.subscribable', title: 'Anmeldbar'},
        {attr: 'labwork.published', title: 'Veröffentlicht'}
    ]

    private readonly labworkActions: LabworkAction[] = [ // TODO permissions?
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

    private subs: Subscription[]

    private static empty(): LabworkProtocol {
        return {label: '', description: '', semester: '', course: '', degree: '', subscribable: false, published: false}
    }

    @ViewChild(MatSort, {static: false}) set matSort(ms: MatSort) { // MatSort is undefined if data is loaded asynchronously
        this.dataSource.sort = ms
    }

    constructor(
        private readonly dialog: MatDialog,
        private readonly alertService: AlertService,
        private readonly route: ActivatedRoute,
        private readonly courseService: CourseService,
        private readonly semesterService: SemesterService,
        private readonly labworkService: LabworkService,
        private readonly labworkApplicationService: LabworkApplicationService
    ) {
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
        this.subs = []
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor
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

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private semesterSortingFn = (lhs: GroupedLabwork, rhs: GroupedLabwork): number => { // TODO this will break if abbreviation do not match the actual dates (e.g. CGA)
        return rhs.value[0].semester.abbreviation.localeCompare(lhs.value[0].semester.abbreviation)
    }

    private sumApplications = (lwas: LabworkWithApplications[]): number => {
        return lwas.reduce((acc, v) => acc + v.applications, 0)
    }

    private reloadDataSource(lwas: LabworkWithApplications[]) {
        this.dataSource.data = lwas
    }

    onSelect(lwa: LabworkWithApplications) {
        console.log(lwa)
    }

    onAction(action: LabworkActionType, labwork: LabworkAtom) {
        switch (action) {
            case 'edit':
                this.edit(labwork)
                break
            case 'delete':
                this.delete(labwork)
                break
            case 'schedule':
                break
            case 'groups':
                break
            case 'graduates':
                break
            case 'applications':
                break

        }
    }

    private delete(labwork: LabworkAtom) {
        const dialogRef = DeleteDialogComponent
            .instance(this.dialog, {label: `${labwork.label} - ${labwork.semester.abbreviation}`, id: labwork.id})

        const s3 = subscribe(
            dialogRef.afterClosed(), id => {
                const s4 = subscribe(
                    this.labworkService.delete(labwork.course.id, id),
                    this.afterDelete.bind(this)
                )

                this.subs.push(s4)
            }
        )

        this.subs.push(s3)
    }

    private edit(labwork: LabworkAtom) {
        const s1 = this.openDialog(DialogMode.edit, labwork, updated => {
            const s2 = subscribe(
                this.labworkService.update(labwork.course.id, updated, labwork.id),
                this.afterUpdate.bind(this)
            )

            this.subs.push(s2)
        })

        this.subs.push(s1)
    }

    private afterDelete(labwork: Labwork) {
        removeFromDataSource(this.alertService, this.dataSource)(labwork, (lwa, l) => lwa.labwork.id === l.id)
    }

    private afterUpdate(labwork: LabworkAtom) {
        this.dataSource.data = this.dataSource.data.map(d => {
            if (d.labwork.id === labwork.id) {
                d.labwork = labwork
                return d
            }

            return d
        })

        this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(labwork))
    }

    // TODO this is copied. build an abstraction?
    private openDialog(mode: DialogMode, data: LabworkAtom | LabworkProtocol, next: (p: LabworkProtocol) => void): Subscription {
        const inputData: FormInputData[] = this.makeFormInputData(data)

        const payload: FormPayload<LabworkProtocol> = {
            headerTitle: dialogTitle(mode, 'Praktikum'),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData,
            makeProtocol: updatedValues => isUniqueEntity(data) ? this.update(data, updatedValues) : this.create(updatedValues)
        }

        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)
        return subscribe(dialogRef.afterClosed(), next)
    }

    private update(labwork: LabworkAtom, updatedOutput: FormOutputData[]): LabworkProtocol {
        return withCreateProtocol(updatedOutput, LabworksComponent.empty(), p => {
            p.semester = labwork.semester.id
            p.course = labwork.course.id
            p.degree = labwork.degree.id
        })
    }

    private create(updatedValues: FormOutputData[]): LabworkProtocol {
        return NotImplementedError()
    }

    private makeFormInputData(data: LabworkAtom | LabworkProtocol): FormInputData[] {
        const isModel = isUniqueEntity(data)

        return [
            {
                formControlName: 'label',
                placeholder: 'Bezeichnung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: data.label
            },
            {
                formControlName: 'description',
                placeholder: 'Beschreibung',
                type: 'text',
                isDisabled: false,
                validator: Validators.required,
                value: data.description
            },
            {
                formControlName: 'semester',
                placeholder: 'Semester',
                type: isModel ? 'text' : 'options',
                isDisabled: isModel,
                validator: isModel ? Validators.required : optionsValidator(),
                value: isUniqueEntity(data) ? data.semester.label : data.semester
            },
            {
                formControlName: 'course',
                placeholder: 'Modul',
                type: isModel ? 'text' : 'options',
                isDisabled: isModel,
                validator: isModel ? Validators.required : optionsValidator(),
                value: isUniqueEntity(data) ? data.course.label : data.course
            },
            {
                formControlName: 'degree',
                placeholder: 'Studiengang',
                type: isModel ? 'text' : 'options',
                isDisabled: isModel,
                validator: isModel ? Validators.required : optionsValidator(),
                value: isUniqueEntity(data) ? data.degree.label : data.degree
            },
            {
                formControlName: 'subscribable',
                placeholder: 'Anmeldbar',
                type: 'boolean',
                isDisabled: false,
                validator: Validators.required,
                value: data.subscribable
            },
            {
                formControlName: 'published',
                placeholder: 'Veröffentlicht',
                type: 'boolean',
                isDisabled: false,
                validator: Validators.required,
                value: data.published
            }
        ]
    }
}
