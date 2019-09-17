import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {Conflict, ScheduleEntryService, SchedulePreview} from '../../../services/schedule-entry.service'
import {foldUndefined, isEmpty, maxBy, minBy, subscribe} from '../../../utils/functions'
import {MatDialog} from '@angular/material'
import {openDialog} from '../../../shared-dialogs/dialog-open-combinator'
import {GroupPreviewModalComponent} from './group-preview-modal/group-preview-modal.component'
import {Observable, Subscription} from 'rxjs'
import {fetchPreview, SchedulePreviewConfig} from './group-preview-view-model'
import {ScheduleEntryLike} from '../../abstract-group-view/abstract-group-view.component'
import {format} from '../../../utils/lwmdate-adapter'
import {LWMActionType} from '../../../table-action-button/lwm-actions'

interface SchedulePreviewResult {
    fitness: number
    conflicts: Conflict[]
}

@Component({
    selector: 'lwm-group-preview',
    templateUrl: './group-preview.component.html',
    styleUrls: ['./group-preview.component.scss']
})
export class GroupPreviewComponent implements OnInit, OnDestroy {

    constructor(
        private readonly dialog: MatDialog,
        private readonly scheduleService: ScheduleEntryService
    ) {
        this.schedulePreviewEmitter = new EventEmitter<SchedulePreview>()
        this.subs = []
        this.scheduleEntries = []
        this.previewIsLoading = false
    }

    @Input() labwork: Readonly<LabworkAtom>
    @Input() applications: Readonly<number>

    @Output() schedulePreviewEmitter: EventEmitter<SchedulePreview>

    private headerTitle: string
    private scheduleEntries: ScheduleEntryLike[]
    private previewResult: SchedulePreviewResult | undefined
    private subs: Subscription[]
    private previewIsLoading: boolean

    ngOnInit() {
        console.log('group preview component loaded')

        this.headerTitle = `[🔓] Gruppen-Vorschau für ${this.labwork.label}`
    }

    ngOnDestroy = () => this.subs.forEach(s => s.unsubscribe())

    private canPreview = (): LWMActionType[] => {
        return ['preview'] // TODO permission check
    }

    private onPreview = () => {
        const preview$ = openDialog(
            GroupPreviewModalComponent.instance(this.dialog, this.applications),
            this.fetchPreview
        )

        this.subs.push(subscribe(preview$, p => {
            this.previewIsLoading = false

            this.schedulePreviewEmitter.emit(p)
            this.scheduleEntries = p.schedule.entries
            this.previewResult = {conflicts: p.conflicts, fitness: p.fitness}
        }))
    }

    private hasConflicts = () => foldUndefined(this.previewResult, r => !isEmpty(r.conflicts), () => false)

    private hasScheduleEntries = () => !isEmpty(this.scheduleEntries)

    private firstDate = () => {
        const min = minBy(this.scheduleEntries, (lhs, rhs) => lhs.date.getTime() < rhs.date.getTime())
        return this.getFormattedDate(min)
    }

    private lastDate = () => {
        const max = maxBy(this.scheduleEntries, (lhs, rhs) => lhs.date.getTime() > rhs.date.getTime())
        return this.getFormattedDate(max)
    }

    private getFormattedDate = entry => foldUndefined(entry, e => format(e.date, 'dd.MM.yyyy'), () => 'Kein Eintrag')

    private fetchPreview = (config: SchedulePreviewConfig): Observable<SchedulePreview> => {
        this.scheduleEntries = []
        this.previewResult = undefined
        this.previewIsLoading = true

        return fetchPreview(this.scheduleService, this.labwork)(config)
    }
}
