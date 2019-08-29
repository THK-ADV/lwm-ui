import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {ActivatedRoute, Router} from '@angular/router'
import {groupBy, map, mergeAll, switchMap, tap, toArray} from 'rxjs/operators'
import {CourseService} from '../services/course.service'
import {identity, merge, Observable, of, Subscription, zip} from 'rxjs'
import {CourseAtom} from '../models/course.model'
import {SemesterService} from '../services/semester.service'
import {Semester} from '../models/semester.model'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {MatDialog, MatSort, MatTableDataSource} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {LabworkService} from '../services/labwork.service'
import {Labwork, LabworkAtom, LabworkProtocol} from '../models/labwork.model'
import {AlertService} from '../services/alert.service'
import {_groupBy, subscribe} from '../utils/functions'
import {removeFromDataSource} from '../shared-dialogs/dataSource.update'
import {CreateUpdateDialogComponent, FormOutputData, FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import {isUniqueEntity} from '../models/unique.entity.model'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {invalidChoiceKey} from '../utils/form.validator'
import {createProtocol, withCreateProtocol} from '../models/protocol.model'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {FormInputString, FormInputTextArea} from '../shared-dialogs/forms/form.input.string'
import {FormInputBoolean} from '../shared-dialogs/forms/form.input.boolean'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {Degree} from '../models/degree.model'
import {DegreeService} from '../services/degree.service'
import {
    deleteAction,
    editAction,
    graduatesAction,
    groupAction,
    labworkApplicationAction,
    LWMAction,
    LWMActionType,
    chainAction
} from '../utils/component.utils'

interface LabworkWithApplications {
    labwork: LabworkAtom
    semester: Semester
    applications: number
}

interface GroupedLabwork {
    key: string
    value: LabworkWithApplications[]
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

    private readonly labworkActions: LWMAction[] = [ // TODO permissions?
        chainAction(),
        labworkApplicationAction(),
        groupAction(),
        graduatesAction(),
        editAction(),
        deleteAction()
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
        private readonly labworkApplicationService: LabworkApplicationService,
        private readonly degreeService: DegreeService,
        private readonly router: Router
    ) {
        this.displayedColumns = this.columns.map(c => c.attr).concat('action') // TODO add permission check
        this.subs = []
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor
    }

    ngOnInit() {
        this.currentSemester$ = this.semesterService.current()

        this.course$ = this.route.paramMap.pipe(
            switchMap(params => this.courseService.get(params.get('cid') || '')),
            tap(course => {
                const labworksWithApps$ = this.labworkService.getAll(course.id).pipe(
                    switchMap(ls => {
                        return ls.map(l => zip(this.labworkApplicationService.getApplicationCount(l.id), of(l)))
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

    // TODO this will break if abbreviation do not match the actual dates (e.g. CGA)
    private semesterSortingFn = (lhs: GroupedLabwork, rhs: GroupedLabwork): number => {
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

    onAction(action: LWMActionType, labwork: LabworkAtom) {
        switch (action) {
            case 'edit':
                this.edit(labwork)
                break
            case 'delete':
                this.delete(labwork)
                break
            case 'chain':
            case 'groups':
            case 'graduates':
            case 'applications':
                this.routeTo(action, labwork)
                break
            default:
                break
        }
    }

    private routeTo(action: LWMActionType, labwork: LabworkAtom) {
        this.router.navigate(['labworks', labwork.id, action], {relativeTo: this.route})
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
        removeFromDataSource(this.dataSource, this.alertService)(labwork, (lwa, l) => lwa.labwork.id === l.id)
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
        const inputData: FormInput[] = this.makeFormInputData(data)

        const payload: FormPayload<LabworkProtocol> = {
            headerTitle: dialogTitle(mode, 'Praktikum'),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData,
            makeProtocol: updatedValues => isUniqueEntity(data) ? this.update(data, updatedValues) : this.create(updatedValues),
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
        return createProtocol(updatedValues, LabworksComponent.empty())
    }

    private makeFormInputData(labwork: LabworkAtom | LabworkProtocol): FormInput[] {
        const isModel = isUniqueEntity(labwork)

        const inputs = [
            {
                formControlName: 'label',
                displayTitle: 'Bezeichnung',
                isDisabled: false,
                data: new FormInputString(labwork.label)
            },
            {
                formControlName: 'description',
                displayTitle: 'Beschreibung',
                isDisabled: false,
                data: new FormInputTextArea(labwork.description)
            },
            {
                formControlName: 'semester',
                displayTitle: 'Semester',
                isDisabled: isModel,
                data: isUniqueEntity(labwork) ?
                    new FormInputString(labwork.semester.label) :
                    new FormInputOption<Semester>(
                        labwork.semester,
                        'semester',
                        invalidChoiceKey,
                        true,
                        semester => semester.label,
                        this.semesterService.getAll()
                    )
            },
            {
                formControlName: 'course',
                displayTitle: 'Modul',
                isDisabled: true,
                data: isUniqueEntity(labwork) ?
                    new FormInputString(labwork.course.label) :
                    new FormInputString(labwork.course)
            },
            {
                formControlName: 'degree',
                displayTitle: 'Studiengang',
                isDisabled: isModel,
                data: isUniqueEntity(labwork) ?
                    new FormInputString(labwork.degree.label) :
                    new FormInputOption<Degree>(
                        labwork.degree,
                        'degree',
                        invalidChoiceKey,
                        true,
                        degree => degree.label,
                        this.degreeService.getAll()
                    )
            },
            {
                formControlName: 'subscribable',
                displayTitle: 'Anmeldbar',
                isDisabled: false,
                data: new FormInputBoolean(labwork.subscribable)
            },
            {
                formControlName: 'published',
                displayTitle: 'Veröffentlicht',
                isDisabled: false,
                data: new FormInputBoolean(labwork.published)
            }
        ]

        return inputs.filter(i => !(!isModel && i.formControlName === 'course'))
    }

    private canCreate(): boolean {
        return true // TODO add permission check
    }

    private onCreate(course: CourseAtom) {
        const s1 = this.openDialog(DialogMode.create, LabworksComponent.empty(), procotol => {
            procotol.course = course.id
            const s2 = subscribe(
                this.labworkService.create(course.id, procotol),
                this.afterCreate.bind(this)
            )
            this.subs.push(s2)
        })

        this.subs.push(s1)
    }

    protected afterCreate(labworks: LabworkAtom[]) {
        const lwas = labworks.map(l => ({labwork: l, semester: l.semester, applications: 0}))
        this.dataSource.data = this.dataSource.data.concat(lwas)
        this.alertService.reportAlert('success', 'created: ' + labworks.map(JSON.stringify.bind(this)))
    }
}
