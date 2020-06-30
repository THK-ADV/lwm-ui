import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {MatPaginator, MatSort, MatTableDataSource, Sort} from '@angular/material'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {nestedObjectSortingDataAccessor} from '../utils/sort'
import {mapUndefined, subscribe} from '../utils/functions'

@Component({
    selector: 'lwm-abstract-table',
    templateUrl: './abstract-table.component.html',
    styleUrls: ['./abstract-table.component.scss']
})
export class AbstractTableComponent<Model> implements OnInit, OnDestroy {

    @Input() columns: TableHeaderColumn[]
    @Input() tableContent: (model: Readonly<Model>, attr: string) => string
    @Input() sort: Sort
    @Input() pageSizeOptions: number[]
    @Input() canEdit: boolean
    @Input() canDelete: boolean
    @Input() filterPredicate: (data: Model, filter: string) => boolean
    @Input() sortingDataAccessor: (data: Model, property: string) => number

    @Input() set data$($: Observable<Model[]>) { // TODO: this is the fix for the comment below. apply everywhere
        this.subscribeAndPush($, data => {
            this.dataSource.data = data
            this.sortDataSource()
        })
    }

    @ViewChild(MatSort, {static: true}) matSort: MatSort
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator

    @Output() editEmitter = new EventEmitter<Readonly<Model>>()
    @Output() deleteEmitter = new EventEmitter<Readonly<Model>>()
    // i don't like it that we expose internal details like the DataSource
    // to all users of this component. but the components need to update the
    // data source somehow. maybe this could be a function which takes the
    // current data of the data source and returns new data instead
    @Output() dataSourceEmitter = new EventEmitter<MatTableDataSource<Model>>()

    dataSource = new MatTableDataSource<Model>()
    private subs: Subscription[]

    displayedColumns: string[]

    constructor() {
        this.subs = []
        this.pageSizeOptions = [25, 50, 100]
        this.tableContent = (model, attr) => model[attr]
        this.sortingDataAccessor = (data, property) => data[property]
    }

    ngOnInit(): void {
        this.displayedColumns = this.columns.map(_ => _.attr)
        if (this.canDelete || this.canEdit) {
            this.displayedColumns.push('action')
        }

        this.setupDataSource()
        this.dataSourceEmitter.emit(this.dataSource)
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    private setupDataSource = () => {
        this.dataSource.sortingDataAccessor = this.sortingDataAccessor
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.matSort
        this.dataSource.sortingDataAccessor = nestedObjectSortingDataAccessor
        mapUndefined(this.filterPredicate, p => this.dataSource.filterPredicate = p)
    }

    applyFilter = (filterValue: string) =>
        this.dataSource.filter = filterValue.trim().toLowerCase() // TODO override this.dataSource.filterPredicate if needed

    onEdit = (model: Model) =>
        this.editEmitter.emit(model)

    onDelete = (model: Model) => {
        this.deleteEmitter.emit(model)
    }

    onSelect = (model: Model) => {
        if (this.canEdit) {
            this.onEdit(model)
        }
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
