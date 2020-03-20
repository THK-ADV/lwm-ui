import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {MatDialog, MatPaginator, MatSort, MatTableDataSource, Sort} from '@angular/material'
import {LWMActionType} from '../table-action-button/lwm-actions'
import {Observable, Subscription} from 'rxjs'
import {mapUndefined, subscribe} from '../utils/functions'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {ValidatorFn} from '@angular/forms'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {openDialogFromPayload, subscribeDeleteDialog} from '../shared-dialogs/dialog-open-combinator'
import {createProtocol} from '../models/protocol.model'
import {addToDataSource, removeFromDataSource, updateDataSource} from '../shared-dialogs/dataSource.update'
import {AlertService} from '../services/alert.service'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {isUniqueEntity, UniqueEntity} from '../models/unique.entity.model'

export interface TableHeaderColumn {
    attr: string
    title: string
}

export interface Creatable<Protocol, Model extends UniqueEntity> {
    dialogTitle: string
    emptyProtocol: () => Protocol
    makeInput: (attr: string, entity: Protocol | Model) => Omit<FormInput, 'formControlName' | 'displayTitle'> | undefined
    commitProtocol: (protocol: Protocol, existing?: Model) => Protocol
    compoundFromGroupValidator: (data: FormInput[]) => ValidatorFn | undefined
    create?: (protocol: Protocol) => Observable<Model>
    update?: (protocol: Protocol, id: string) => Observable<Model>
}

export interface Deletable<Model extends UniqueEntity> {
    titleForDialog: (m: Model) => string
    delete: (id: string) => Observable<Model>
}

@Component({
    selector: 'lwm-abstract-crud',
    templateUrl: './abstract-crud.component.html',
    styleUrls: ['./abstract-crud.component.scss']
})
export class AbstractCrudComponent<Protocol, Model extends UniqueEntity> implements OnInit, OnDestroy {

    @Input() headerTitle: string
    @Input() columns: TableHeaderColumn[]
    @Input() tableContent: (model: Readonly<Model>, attr: string) => string
    @Input() data$: Observable<Model[]>
    @Input() sort: Sort
    @Input() pageSizeOptions: number[] = [25, 50, 100]

    @Input() creatable: Creatable<Protocol, Model>
    @Input() deletable: Deletable<Model>

    @ViewChild(MatSort, {static: true}) matSort: MatSort
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator

    private subs: Subscription[]
    dataSource: MatTableDataSource<Model>
    displayedColumns: string[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly alertService: AlertService,
    ) {
        this.dataSource = new MatTableDataSource<Model>()
        this.subs = []
    }

    ngOnInit(): void {
        this.displayedColumns = this.columns.map(_ => _.attr)

        if (this.creatable?.create || this.deletable) {
            this.displayedColumns.push('action')
        }

        this.setupDataSource()
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private setupDataSource = () => {
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.matSort
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor

        this.subscribeAndPush(
            this.data$,
            data => {
                this.dataSource.data = data
                this.sortDataSource()
            })
    }

    canCreate = (): LWMActionType[] =>
        this.creatable?.create ? ['create'] : []

    onCreate = () =>
        mapUndefined(this.creatable.create, f => this.createOrUpdate(this.creatable.emptyProtocol(), f))

    onUpdate = (existing: Model, update$: (p: Protocol, id: string) => Observable<Model>) =>
        this.createOrUpdate({...existing}, p => update$(p, existing.id))

    onDelete = (model: Model) => {
        const updateUI = (m: Model) =>
            removeFromDataSource(this.dataSource, this.alertService)(_ => _.id === m.id)

        const dialogRef = DeleteDialogComponent.instance(
            this.dialog,
            {label: this.deletable.titleForDialog(model), id: model.id}
        )

        this.subs.push(subscribeDeleteDialog(
            dialogRef,
            this.deletable.delete,
            updateUI,
            this.alertService.reportError
        ))
    }

    onSelect = (m: Model) =>
        mapUndefined(this.creatable?.update, f => this.onUpdate(m, f))

    private createOrUpdate = (entity: Protocol | Model, performRequest: (protocol: Protocol) => Observable<Model>) => {
        const isModel = isUniqueEntity(entity)
        const mode = isModel ? DialogMode.edit : DialogMode.create

        const updateUI = (m: Model) =>
            isModel ?
                updateDataSource(this.dataSource, this.alertService)(m, (lhs, rhs) => lhs.id === rhs.id) :
                addToDataSource(this.dataSource, this.alertService)(m)

        const emptyProtocol = this.creatable.emptyProtocol()
        const input: FormInput[] = this.columns.map(c => ({
            formControlName: c.attr,
            displayTitle: c.title,
            // this is safe here, because every attribute maps to an input
            // tslint:disable-next-line:no-non-null-assertion
            ...this.creatable.makeInput(c.attr, entity)!!
        }))

        const formPayload: FormPayload<Protocol> = {
            headerTitle: dialogTitle(mode, this.creatable.dialogTitle),
            submitTitle: dialogSubmitTitle(mode),
            data: input,
            composedFromGroupValidator: this.creatable.compoundFromGroupValidator(input),
            makeProtocol: output => this.creatable.commitProtocol(
                createProtocol(output, emptyProtocol),
                isUniqueEntity(entity) ? entity : undefined
            )
        }

        this.subscribeAndPush(
            openDialogFromPayload(
                this.dialog,
                formPayload,
                performRequest
            ),
            updateUI
        )
    }

    applyFilter = (filterValue: string) => {
        this.dataSource.filter = filterValue.trim().toLowerCase() // TODO override this.dataSource.filterPredicate if needed
    }

    private sortDataSource = () =>
        mapUndefined(this.sort, s => {
            this.matSort.active = s.active
            this.matSort.direction = s.direction
            this.matSort.sortChange.emit(s)
        })

    private subscribeAndPush = <T>($: Observable<T>, next: (t: T) => void) => {
        this.subs.push(subscribe($, next))
    }
}
