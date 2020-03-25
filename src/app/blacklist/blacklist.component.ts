import {Component, OnDestroy} from '@angular/core'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {identity, Observable, Subscription} from 'rxjs'
import {Blacklist, BlacklistProtocol} from '../models/blacklist.model'
import {BlacklistRangeProtocol, BlacklistService} from '../services/blacklist.service'
import {
    createGlobalBlacklistFromOutputData,
    createGlobalBlacklistRangeFromOutputData,
    emptyGlobalBlacklistProtocol,
    formatBlacklistTableEntry,
    globalBlacklistColumns,
    globalBlacklistInputData,
    globalBlacklistRangeInputData
} from './blacklist-view-model'
import {LWMActionType} from '../table-action-button/lwm-actions'
import {MatDialog, MatTableDataSource} from '@angular/material'
import {Decision, DecisionDialogComponent} from '../shared-dialogs/decision-dialog/decision-dialog.component'
import {openConfirmationDialog, openDialog, openDialogFromPayload, subscribeDeleteDialog} from '../shared-dialogs/dialog-open-combinator'
import {FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import {DialogMode, dialogSubmitTitle, dialogTitle} from '../shared-dialogs/dialog.mode'
import {nonEmpty, subscribe} from '../utils/functions'
import {addManyToDataSource, removeFromDataSource, updateDataSource} from '../shared-dialogs/dataSource.update'
import {AlertService} from '../services/alert.service'
import {DeleteDialogComponent} from '../shared-dialogs/delete/delete-dialog.component'
import {format} from '../utils/lwmdate-adapter'
import {isUniqueEntity} from '../models/unique.entity.model'
import {ConfirmDialogComponent} from '../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {switchMap} from 'rxjs/operators'
import {PartialResult} from '../services/http.service'
import {makeHtmlParagraphs} from '../html-builder/html-builder'

@Component({
    selector: 'lwm-blacklist',
    templateUrl: './blacklist.component.html',
    styleUrls: ['./blacklist.component.scss']
})
export class BlacklistComponent implements OnDestroy {

    columns: TableHeaderColumn[]
    tableContent: (model: Readonly<Blacklist>, attr: string) => string
    blacklists$: Observable<Blacklist[]>

    private dataSource: MatTableDataSource<Blacklist>
    private subs: Subscription[]

    constructor(
        private readonly service: BlacklistService,
        private readonly dialog: MatDialog,
        private readonly alert: AlertService,
    ) {
        this.columns = globalBlacklistColumns()
        this.blacklists$ = service.getAllWithFilter({attribute: 'global', value: 'true'})
        this.tableContent = formatBlacklistTableEntry
        this.subs = []
    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    actions = (): LWMActionType[] => ['download', 'create']

    onAction = (a: LWMActionType) => {
        switch (a) {
            case 'create':
                this.onCreate()
                break
            case 'download':
                this.download()
                break
            default:
                this.alert.reportError(new Error(`action ${a} is currently not supported`))
                break
        }
    }


    private download = () => {
        const year = new Date().getFullYear()
        const $ = this.service.preview(year).pipe(
            switchMap(xs => {
                    const dialogRef = ConfirmDialogComponent.instance(
                        this.dialog,
                        {
                            title: `Globale Feiertage für ${year} übernehmen?`,
                            body: makeHtmlParagraphs(xs, x => `${format(x.date, 'dd.MM.yyyy')} - ${x.label}`)
                        }
                    )

                    return openConfirmationDialog(dialogRef, () => this.service.download(year))
                }
            )
        )

        const updateUI = (r: PartialResult<Blacklist>) => {
            if (nonEmpty(r.failed)) {
                this.alert.reportAlert({type: 'danger', body: makeHtmlParagraphs(r.failed, identity)})
            }

            if (nonEmpty(r.created)) {
                addManyToDataSource(this.dataSource, this.alert)(r.created)
            }
        }

        this.subs.push(subscribe($, updateUI))
    }

    private onCreate = () => {
        const decide = (d: Decision): Observable<Blacklist | Blacklist[]> => {
            const mode = DialogMode.create

            switch (d.kind) {
                case 'first':
                    return this.openUpdateDialog(emptyGlobalBlacklistProtocol(), this.service.create)
                case 'second':
                    const payload: FormPayload<BlacklistRangeProtocol> = {
                        headerTitle: dialogTitle(mode, 'Globale Blacklists'),
                        submitTitle: dialogSubmitTitle(mode),
                        data: globalBlacklistRangeInputData(),
                        makeProtocol: createGlobalBlacklistRangeFromOutputData
                    }

                    return openDialogFromPayload(this.dialog, payload, this.service.createFromRange)
            }
        }

        const dialogRef = DecisionDialogComponent.instance(
            this.dialog,
            'Einzelnen Tag hinzufügen',
            'Zeitraum erstellen'
        )

        const s = subscribe(
            openDialog(dialogRef, decide),
            addManyToDataSource(this.dataSource, this.alert)
        )

        this.subs.push(s)
    }

    onDelete = (blacklist: Blacklist) => {
        const updateUI = (bl: Blacklist) =>
            removeFromDataSource(this.dataSource, this.alert)(_ => _.id === bl.id)

        const dialogRef = DeleteDialogComponent.instance(
            this.dialog,
            {label: `${blacklist.label}: ${format(blacklist.date, 'dd.MM.yyyy')}`, id: blacklist.id}
        )

        const s = subscribeDeleteDialog(
            dialogRef,
            this.service.delete,
            updateUI,
            this.alert.reportError
        )

        this.subs.push(s)
    }

    onEdit = (blacklist: Blacklist) => {
        const updateUI = (bl: Blacklist) =>
            updateDataSource(this.dataSource, this.alert)(bl, (lhs, rhs) => lhs.id === rhs.id)

        const $ = this.openUpdateDialog(
            blacklist,
            b => this.service.update(b, blacklist.id)
        )

        this.subs.push(subscribe($, updateUI))
    }

    initDataSource = (ds: MatTableDataSource<Blacklist>) =>
        this.dataSource = ds

    private openUpdateDialog = (
        blacklist: BlacklistProtocol | Blacklist,
        andThen: (b: BlacklistProtocol) => Observable<Blacklist>
    ) => {
        const isModel = isUniqueEntity(blacklist)
        const mode = isModel ? DialogMode.edit : DialogMode.create
        const payload: FormPayload<BlacklistProtocol> = {
            headerTitle: dialogTitle(mode, 'Globale Blacklist'),
            submitTitle: dialogSubmitTitle(mode),
            data: globalBlacklistInputData(blacklist, isModel),
            makeProtocol: createGlobalBlacklistFromOutputData(isUniqueEntity(blacklist) ? blacklist : undefined)
        }

        return openDialogFromPayload(this.dialog, payload, andThen)
    }
}
