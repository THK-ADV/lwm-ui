import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {MatDialog, MatPaginator, MatSort, MatTableDataSource, Sort, SortDirection} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {
    CreateUpdateDialogComponent,
    FormInputData,
    FormInputOption,
    FormOutputData
} from '../shared-dialogs/create-update/create-update-dialog.component'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {AbstractCRUDService} from './abstract-crud.service'
import {exists, subscribe} from '../utils/functions'
import {ValidatorFn} from '@angular/forms'
import {isUniqueEntity, UniqueEntity} from '../models/unique.entity.model'
import {removeFromDataSource} from '../shared-dialogs/dataSource.update'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'

export interface TableHeaderColumn {
    attr: string
    title: string
}

export type Action = 'create' | 'update' | 'delete'

@Component({
    selector: 'app-abstract-crud',
    templateUrl: './abstract-crud.component.html',
    styleUrls: ['./abstract-crud.component.scss']
})
export abstract class AbstractCRUDComponent<Protocol, Model extends UniqueEntity> implements OnInit, OnDestroy {
    protected subs: Subscription[] = []
    protected dataSource = new MatTableDataSource<Model>()

    protected service: AbstractCRUDService<Protocol, Model>
    protected inputOption?: FormInputOption<Object> = undefined

    private readonly displayedColumns: string[]

    @ViewChild(MatSort, {static: true}) sort: MatSort
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator

    constructor(
        protected readonly dialog: MatDialog,
        protected readonly alertService: AlertService,
        protected readonly columns: TableHeaderColumn[],
        protected readonly actions: Action[],
        protected readonly sortDescriptor: string, // TODO this should be a keyPath of Model
        protected readonly modelName: string,
        protected readonly headerTitle: string,
        protected readonly inputData: (data: Readonly<Protocol | Model>, isModel: boolean) => FormInputData[],
        protected readonly titleForDeleteDialog: (model: Readonly<Model>) => string,
        protected readonly prepareTableContent: (model: Readonly<Model>, attr: string) => string,
        protected readonly empty: () => Readonly<Protocol>,
        protected readonly composedFromGroupValidator: (data: FormInputData[]) => ValidatorFn | undefined,
        protected readonly pageSizeOptions: number[] = [25, 50, 100]
    ) {
        this.displayedColumns = columns.map(c => c.attr).concat('action') // TODO add permission check
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.subscribeAndPush(this.service.getAll(), data => {
            this.dataSource.data = data
            this.sortBy(this.sortDescriptor)
        })

        this.dataSource.paginator = this.paginator
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private canCreate(): boolean {
        return exists(this.actions, a => a === 'create')
    }

    private canEdit(): boolean {
        return exists(this.actions, a => a === 'update')
    }

    private canDelete(): boolean {
        return exists(this.actions, a => a === 'delete')
    }

    private onSelect(model: Model) {
        this.onEdit(model)
    }

    protected onEdit(model: Model) {
        model = {...model}
        this.openDialog(DialogMode.edit, model, updatedModel => {
            this.subscribeAndPush(this.service.update(updatedModel, model.id), this.afterUpdate.bind(this))
        })
    }

    private onDelete(model: Model) {
        const dialogRef = DeleteDialogComponent.instance(this.dialog, {label: this.titleForDeleteDialog(model), id: model.id})

        this.subscribeAndPush(
            dialogRef.afterClosed(),
            id => this.subscribeAndPush(
                this.service.delete(id),
                this.afterDelete.bind(this)
            )
        )
    }

    protected onCreate() {
        this.openDialog(
            DialogMode.create,
            this.empty(),
            model => this.subscribeAndPush(this.service.createMany(model), this.afterCreate.bind(this))
        )
    }

    private openDialog<T extends Protocol>(mode: DialogMode, data: Model | Protocol, next: (T) => void) {
        const inputData = this.inputData(data, isUniqueEntity(data))

        const payload = {
            headerTitle: dialogTitle(mode, this.modelName),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData,
            makeProtocol: updatedValues => isUniqueEntity(data) ? this.update(data, updatedValues) : this.create(updatedValues),
            composedFromGroupValidator: this.composedFromGroupValidator(inputData),
            formInputOption: this.inputOption
        }

        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)
        this.subscribeAndPush(dialogRef.afterClosed(), next)
    }

    protected applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase() // TODO override this.dataSource.filterPredicate if needed
    }

    protected sortBy(label: string, ordering: SortDirection = 'asc') {
        const sortState: Sort = {active: label, direction: ordering}
        this.sort.active = sortState.active
        this.sort.direction = sortState.direction
        this.sort.sortChange.emit(sortState)
    }

    protected subscribeAndPush<T>(observable: Observable<T>, next: (t: T) => void) {
        this.subs.push(subscribe(observable, next))
    }

    abstract create(output: FormOutputData[]): Protocol

    abstract update(model: Model, updatedOutput: FormOutputData[]): Protocol

    protected afterUpdate(model: Model) {
        this.dataSource.data = this.dataSource.data.map(d => {
            return d.id === model.id ? model : d
        })

        this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(model))
    }

    protected afterCreate(models: Model[]) {
        this.dataSource.data = this.dataSource.data.concat(models)
        this.alertService.reportAlert('success', 'created: ' + models.map(JSON.stringify.bind(this)).join(', '))
    }

    protected afterDelete(model: Model) { // TODO test
        removeFromDataSource(this.alertService, this.dataSource)(model, (a, t) => a.id === t.id)
        // this.dataSource.data = this.dataSource.data.filter(r => r.id !== model.id)
        // this.alertService.reportAlert('success', 'deleted: ' + JSON.stringify(model))
    }
}
