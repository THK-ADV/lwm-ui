import {Component, Input, OnDestroy} from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {MatTableDataSource} from '@angular/material/table'
import {Sort} from '@angular/material/sort'
import {Observable, Subscription} from 'rxjs'
import {mapUndefined, subscribe} from '../utils/functions'
import {FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {ValidatorFn} from '@angular/forms'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {openDialogFromPayload, subscribeDeleteDialog} from '../shared-dialogs/dialog-open-combinator'
import {createProtocol} from '../models/protocol.model'
import {AlertService} from '../services/alert.service'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {isUniqueEntity, UniqueEntity} from '../models/unique.entity.model'
import {addToDataSource, removeFromDataSource, updateDataSource} from '../shared-dialogs/dataSource.update'
import {ActionType} from '../abstract-header/abstract-header.component'

export interface TableHeaderColumn {
    attr: string
    title: string
}

export interface Creatable<Protocol, Model extends UniqueEntity> {
    dialogTitle: string
    emptyProtocol: () => Protocol
    makeInput: (attr: string, entity: Protocol | Model) => Omit<FormInput, 'formControlName' | 'displayTitle'> | undefined
    commitProtocol: (protocol: Protocol, existing?: Model) => Protocol
    compoundFromGroupValidator?: (data: FormInput[]) => ValidatorFn | undefined
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
export class AbstractCrudComponent<Protocol, Model extends UniqueEntity> implements OnDestroy {

    @Input() headerTitle: string
    @Input() columns: TableHeaderColumn[]
    @Input() tableContent: (model: Readonly<Model>, attr: string) => string
    @Input() data$: Observable<Model[]>
    @Input() sort: Sort
    @Input() filterPredicate: (data: Model, filter: string) => boolean

    @Input() creatable: Creatable<Protocol, Model>
    @Input() deletable: Deletable<Model>

    private subs: Subscription[]
    private dataSource: MatTableDataSource<Model>

    constructor(
        private readonly dialog: MatDialog,
        private readonly alertService: AlertService,
    ) {
        this.subs = []
        this.tableContent = (model, attr) => model[attr]
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    initDataSource = (ds: MatTableDataSource<Model>) =>
        this.dataSource = ds

    canCreate = (): ActionType[] =>
        this.creatable?.create ? [{type: 'create', label: undefined}] : []

    canEdit = () => this.creatable?.update !== undefined

    canDelete = () => this.deletable !== undefined

    onCreate = () => mapUndefined(
        this.creatable.create,
        f => this.createOrUpdate(this.creatable.emptyProtocol(), f)
    )

    onEdit = (model: Model) => mapUndefined(
        this.creatable?.update,
        f => this.createOrUpdate({...model}, p => f(p, model.id))
    )

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

    private createOrUpdate = (
        entity: Protocol | Model,
        performRequest: (protocol: Protocol) => Observable<Model>
    ) => {
        const isModel = isUniqueEntity(entity)
        const mode = isModel ? DialogMode.edit : DialogMode.create

        const updateUI = (m: Model) => isModel ?
            updateDataSource(this.dataSource, this.alertService)(m, (lhs, rhs) => lhs.id === rhs.id) :
            addToDataSource(this.dataSource, this.alertService)(m)


        const emptyProtocol = this.creatable.emptyProtocol()
        const input: FormInput[] = []

        this.columns.forEach(c => {
            const i = this.creatable.makeInput(c.attr, entity)

            if (i) {
                input.push({
                    formControlName: c.attr,
                    displayTitle: c.title,
                    ...i
                })
            }
        })

        const formPayload: FormPayload<Protocol> = {
            headerTitle: dialogTitle(mode, this.creatable.dialogTitle),
            submitTitle: dialogSubmitTitle(mode),
            data: input,
            composedFromGroupValidator: mapUndefined(this.creatable.compoundFromGroupValidator, f => f(input)),
            makeProtocol: output => this.creatable.commitProtocol( // TODO maybe we should merge withCreateProtocol with makeProtocol and give the user the chance to catch up with disabled updates. since they are always used together. don't they?
                createProtocol(output, emptyProtocol),
                isUniqueEntity(entity) ? entity : undefined
            )
        }

        const s = subscribe(
            openDialogFromPayload(
                this.dialog,
                formPayload,
                performRequest
            ),
            updateUI
        )

        this.subs.push(s)
    }
}
