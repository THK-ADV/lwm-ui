import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {MatDialog, MatSort, MatTableDataSource, Sort, SortDirection} from '@angular/material'
import {AlertService} from '../services/alert.service'
import {
    CreateUpdateDialogComponent,
    FormInputData,
    FormOutputData,
    FormPayload
} from '../shared-dialogs/create-update/create-update-dialog.component'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {AbstractCRUDService} from './abstract-crud.service'
import {exists} from '../utils/functions'

enum DialogMode {
    edit, create
}

export interface UniqueEntity {
    id: string
}

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
export class AbstractCRUDComponent<Protocol, Model extends UniqueEntity> implements OnInit, OnDestroy {
    protected subs: Subscription[] = []
    protected dataSource = new MatTableDataSource<Model>()

    protected service: AbstractCRUDService<Protocol, Model>
    protected empty: Protocol

    private readonly displayedColumns: string[]

    @ViewChild(MatSort, {static: true}) sort: MatSort

    constructor(
        protected readonly dialog: MatDialog,
        protected readonly alertService: AlertService,
        protected readonly columns: TableHeaderColumn[],
        protected readonly actions: Action[],
        protected readonly sortDescriptor: string, // TODO this should be a keyPath of Model
        protected readonly modelName: string,
        protected readonly headerTitle: string,
        protected readonly inputData: (data: Protocol | Model, isModel: boolean) => FormInputData[],
        protected readonly titleForDeleteDialog: (model: Model) => string,
        protected readonly prepareTableContent: (model: Model, attr: string) => string
    ) {
        this.displayedColumns = columns.map(c => c.attr).concat('action') // TODO add permission check
    }

    ngOnInit() {
        this.dataSource.sort = this.sort

        this.subscribe(this.service.get(), data => {
            this.dataSource.data = data
            this.sortBy(this.sortDescriptor)
        })
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

    private onSelect(model) {
        this.onEdit(model)
    }

    private onEdit(model) {
        this.openDialog(DialogMode.edit, model, updatedRoom => {
            this.subscribe(this.service.update(updatedRoom, model.id), this.afterUpdate.bind(this))
        })
    }

    private onDelete(model) {
        const dialogRef = DeleteDialogComponent.instance(this.dialog, {label: this.titleForDeleteDialog(model), id: model.id})

        this.subscribe(
            dialogRef.afterClosed(),
            id => this.subscribe(
                this.service.delete(id),
                this.afterDelete.bind(this)
            )
        )
    }

    private onCreate() {
        this.openDialog(
            DialogMode.create,
            this.empty,
            model => this.subscribe(this.service.create(model), this.afterCreate.bind(this))
        )
    }

    private openDialog<T>(mode: DialogMode, data: Model | Protocol, next: (T) => void) {
        const isModel = 'id' in data

        const payload: FormPayload = {
            headerTitle: this.dialogTitle(mode),
            submitTitle: this.dialogSubmitTitle(mode),
            data: this.inputData(data, isModel),
            builder: outputData => isModel ? this.update(data as Model, outputData) : this.create(data as Protocol, outputData)
        }

        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)

        this.subscribe(dialogRef.afterClosed(), next)
    }

    protected subscribe<T>(observable: Observable<T>, next: (T) => void) {
        this.subs.push(observable.subscribe(e => {
            if (e) {
                next(e)
            }
        }))
    }

    protected sortBy(label: string, ordering: SortDirection = 'asc') {
        const sortState: Sort = {active: label, direction: ordering}
        this.sort.active = sortState.active
        this.sort.direction = sortState.direction
        this.sort.sortChange.emit(sortState)
    }

    protected dialogTitle(mode: DialogMode): string {
        switch (mode) {
            case DialogMode.create:
                return `${this.modelName} erstellen`
            case DialogMode.edit:
                return `${this.modelName} bearbeiten`
        }
    }

    protected dialogSubmitTitle(mode: DialogMode): string {
        switch (mode) {
            case DialogMode.create:
                return 'Erstellen'
            case DialogMode.edit:
                return 'Aktualisieren'
        }
    }

    protected create(protocol: Protocol, data: FormOutputData[]): Protocol {
        data.forEach(d => protocol[d.formControlName] = d.value)
        return protocol
    }

    protected update(model: Model, data: FormOutputData[]): Model {
        data.forEach(d => model[d.formControlName] = d.value)
        return model
    }

    protected afterUpdate(model: Model) {
        this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(model))
    }

    protected afterCreate(models: Model[]) {
        this.dataSource.data = this.dataSource.data.concat(models)
        this.alertService.reportAlert('success', 'created: ' + models.map(JSON.stringify.bind(this)).join(', '))
    }

    protected afterDelete(model: Model) {
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== model.id)
        this.alertService.reportAlert('success', 'deleted: ' + JSON.stringify(model))
    }
}
