import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {Conflict, ScheduleEntryService, SchedulePreview} from '../../../services/schedule-entry.service'
import {compose, foldUndefined, isEmpty, maxBy, minBy, nonEmpty, subscribe} from '../../../utils/functions'
import {MatDialog} from '@angular/material/dialog'
import {openDialog} from '../../../shared-dialogs/dialog-open-combinator'
import {GroupPreviewModalComponent} from './group-preview-modal/group-preview-modal.component'
import {Observable, Subscription} from 'rxjs'
import {fetchPreview, SchedulePreviewConfig} from './group-preview-view-model'
import {ScheduleEntryLike} from '../../abstract-group-view/abstract-group-view.component'
import {format} from '../../../utils/lwmdate-adapter'
import {LoadingService, withSpinning} from '../../../services/loading.service'
import {ActionType} from '../../../abstract-header/abstract-header.component'

interface SchedulePreviewResult {
    fitness: number
    conflicts: Conflict[]
}

@Component({
    selector: 'lwm-group-preview',
    templateUrl: './group-preview.component.html',
    styleUrls: ['./group-preview.component.scss'],
    standalone: false
})
export class GroupPreviewComponent implements OnInit, OnDestroy {

    constructor(
        private readonly dialog: MatDialog,
        private readonly scheduleService: ScheduleEntryService,
        private readonly loadingService: LoadingService
    ) {
        this.schedulePreviewEmitter = new EventEmitter<SchedulePreview>()
        this.subs = []
        this.scheduleEntries = []
    }

    @Input() labwork: Readonly<LabworkAtom>
    @Input() applications: Readonly<number>
    @Input() hasPermission: Readonly<boolean>

    @Input() set preview(maybePreview: Readonly<SchedulePreview> | undefined) {
        const setPreview = (p: Readonly<SchedulePreview>) => {
            this.scheduleEntries = p.schedule.entries
            this.previewResult = {conflicts: p.conflicts, fitness: p.fitness}
        }

        const resetPreview = () => {
            this.scheduleEntries = []
            this.previewResult = undefined
        }

        foldUndefined(maybePreview, setPreview, resetPreview)
    }

    @Output() schedulePreviewEmitter: EventEmitter<SchedulePreview>

    headerTitle: string
    scheduleEntries: ScheduleEntryLike[]
    previewResult: SchedulePreviewResult | undefined
    private subs: Subscription[]

    ngOnInit() {
        console.log('group preview component loaded')

        this.headerTitle = `Gruppen-Vorschau für ${this.labwork.label}`
    }

    ngOnDestroy = () => this.subs.forEach(s => s.unsubscribe())

    canPreview = (): ActionType[] =>
        this.hasPermission ? [{type: 'preview', label: 'Vorschau'}] : []

    onPreview = () => {
        const preview$ = openDialog(
            GroupPreviewModalComponent.instance(this.dialog, this.applications),
            compose(this.fetchPreview, withSpinning(this.loadingService))
        )

        const s = subscribe(preview$, p => this.schedulePreviewEmitter.emit(p))
        this.subs.push(s)
    }

    hasConflicts = () =>
        foldUndefined(this.previewResult, r => !isEmpty(r.conflicts), () => false)

    hasScheduleEntries = () =>
        nonEmpty(this.scheduleEntries)

    firstDate = () => {
        const min = minBy(this.scheduleEntries, (lhs, rhs) => lhs.date.getTime() < rhs.date.getTime())
        return this.getFormattedDate(min)
    }

    lastDate = () => {
        const max = maxBy(this.scheduleEntries, (lhs, rhs) => lhs.date.getTime() > rhs.date.getTime())
        return this.getFormattedDate(max)
    }

    private getFormattedDate = entry => foldUndefined(entry, e => format(e.date, 'dd.MM.yyyy'), () => 'Kein Eintrag')

    private fetchPreview = (config: SchedulePreviewConfig): Observable<SchedulePreview> => {
        this.preview = undefined
        return fetchPreview(this.scheduleService, this.labwork)(config)
    }
}
