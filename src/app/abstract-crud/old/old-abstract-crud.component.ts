// import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
// import {Observable, Subscription} from 'rxjs'
// import {MatDialog, MatPaginator, MatSort, MatTableDataSource, Sort, SortDirection} from '@angular/material'
// import {AlertService} from '../../services/alert.service'
// import {CreateUpdateDialogComponent, FormOutputData} from '../../shared-dialogs/create-update/create-update-dialog.component'
// import {DeleteDialogComponent} from '../../shared-dialogs/delete/delete-dialog.component'
// import {AbstractCRUDService} from '../abstract-crud.service'
// import {exists, subscribe} from '../../utils/functions'
// import {ValidatorFn} from '@angular/forms'
// import {isUniqueEntity, UniqueEntity} from '../../models/unique.entity.model'
// import {addToDataSource, removeFromDataSource} from '../../shared-dialogs/dataSource.update'
// import {DialogMode, dialogSubmitTitle, dialogTitle} from '../../shared-dialogs/dialog.mode'
// import {FormInput} from '../../shared-dialogs/forms/form.input'
// import {openDialog} from '../../shared-dialogs/dialog-open-combinator'
// import {LWMActionType} from '../../table-action-button/lwm-actions'
//
export interface TableHeaderColumn {
    attr: string
    title: string
}

// export type Action = 'create' | 'update' | 'delete'
//
// @Component({
//     selector: 'app-abstract-crud',
//     templateUrl: './old-abstract-crud.component.html',
//     styleUrls: ['./old-abstract-crud.component.scss']
// })
// export abstract class OldAbstractCrudComponent<Protocol, Model extends UniqueEntity> implements OnInit, OnDestroy {
//     protected subs: Subscription[] = []
//     dataSource = new MatTableDataSource<Model>()
//
//     readonly displayedColumns: string[]
//     private readonly service: AbstractCRUDService<Protocol, Model>
//
//     @ViewChild(MatSort, {static: true}) sort: MatSort
//     @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
//
//     constructor(
//         public readonly abstractCRUDService: () => AbstractCRUDService<Protocol, Model>,
//         public readonly dialog: MatDialog,
//         public readonly alertService: AlertService,
//         public readonly columns: TableHeaderColumn[],
//         public readonly actions: Action[],
//         public readonly sortDescriptor: string, // TODO this should be a keyPath of Model
//         public readonly modelName: string,
//         public headerTitle: string,
//         public readonly inputData: (data: Readonly<Protocol | Model>, isModel: boolean) => FormInput[],
//         public readonly titleForDeleteDialog: (model: Readonly<Model>) => string,
//         public readonly prepareTableContent: (model: Readonly<Model>, attr: string) => string,
//         public readonly empty: () => Readonly<Protocol>,
//         public readonly composedFromGroupValidator: (data: FormInput[]) => ValidatorFn | undefined,
//         public readonly pageSizeOptions: number[] = [25, 50, 100]
//     ) {
//         this.displayedColumns = columns.map(c => c.attr).concat('action') // TODO add permission check
//         this.service = abstractCRUDService()
//     }
//
//     ngOnInit() {
//         this.dataSource.sort = this.sort
//         this.dataSource.paginator = this.paginator
//     }
//
//     ngOnDestroy(): void {
//         this.subs.forEach(s => s.unsubscribe())
//     }
//
//     fetchData(observable: Observable<Model[]> = this.service.getAll()) {
//         this.subscribeAndPush(observable, data => {
//             this.dataSource.data = data
//             this.sortBy(this.sortDescriptor)
//         })
//     }
//
//     canCreate = (): LWMActionType[] => exists(this.actions, a => a === 'create') ? ['create'] : []
//
//     canEdit = (): boolean => exists(this.actions, a => a === 'update')
//
//     canDelete = (): boolean => exists(this.actions, a => a === 'delete')
//
//     onSelect = (model: Model) => {
//         if (this.canEdit()) {
//             this.onEdit(model)
//         }
//     }
//
//     onEdit(model: Model) {
//         model = {...model}
//         this.openDialog_(DialogMode.edit, model, updatedModel => {
//             this.subscribeAndPush(this.service.update(updatedModel, model.id), this.afterUpdate)
//         })
//     }
//
//     onDelete = (model: Model) => {
//         const dialogRef = DeleteDialogComponent.instance(this.dialog, {label: this.titleForDeleteDialog(model), id: model.id})
//
//         this.subscribeAndPush(
//             openDialog(dialogRef, this.service.delete),
//             this.afterDelete
//         )
//     }
//
//     onCreate = () => {
//         this.openDialog_(
//             DialogMode.create,
//             this.empty(),
//             model => this.subscribeAndPush(this.service.create(model), this.afterCreate)
//         )
//     }
//
//     private openDialog_<T extends Protocol>(mode: DialogMode, data: Model | Protocol, next: (T) => void) { // TODO remove soon
//         const inputData = this.inputData(data, isUniqueEntity(data))
//
//         const payload = {
//             headerTitle: dialogTitle(mode, this.modelName),
//             submitTitle: dialogSubmitTitle(mode),
//             data: inputData,
//             makeProtocol: updatedValues => isUniqueEntity(data) ? this.update(data, updatedValues) : this.create(updatedValues),
//             composedFromGroupValidator: this.composedFromGroupValidator(inputData)
//         }
//
//         const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)
//         this.subscribeAndPush(dialogRef.afterClosed(), next)
//     }
//
//     applyFilter = (filterValue: string) => {
//         this.dataSource.filter = filterValue.trim().toLowerCase() // TODO override this.dataSource.filterPredicate if needed
//     }
//
//     protected sortBy(label: string, ordering: SortDirection = 'asc') {
//         const sortState: Sort = {active: label, direction: ordering}
//         this.sort.active = sortState.active
//         this.sort.direction = sortState.direction
//         this.sort.sortChange.emit(sortState)
//     }
//
//     protected subscribeAndPush<T>(observable: Observable<T>, next: (t: T) => void) {
//         this.subs.push(subscribe(observable, next))
//     }
//
//     abstract create(output: FormOutputData[]): Protocol
//
//     abstract update(model: Model, updatedOutput: FormOutputData[]): Protocol
//
//     private afterUpdate = (model: Model) => {
//         this.dataSource.data = this.dataSource.data.map(d => {
//             return d.id === model.id ? model : d
//         })
//
//         this.alertService.reportAlert('success', 'updated: ' + JSON.stringify(model))
//     }
//
//     private afterCreate = (model: Model) => {
//         addToDataSource(this.dataSource, this.alertService)(model)
//     }
//
//     private afterDelete = (model: Model) => {
//         removeFromDataSource(this.dataSource, this.alertService)(e => e.id === model.id)
//     }
// }
