import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {ScheduleEntryService, SchedulePreview} from '../../services/schedule-entry.service'
import {subscribe} from '../../utils/functions'
import {MatDialog} from '@angular/material'
import {openDialog} from '../../shared-dialogs/dialog-open-combinator'
import {GroupPreviewModalComponent} from './group-preview-modal/group-preview-modal.component'
import {Subscription} from 'rxjs'
import {fetchPreview} from './group-preview-view-model'
import {ScheduleEntryLike} from '../group-card-view/group-card-view.component'

@Component({
    selector: 'lwm-group-preview',
    templateUrl: './group-preview.component.html',
    styleUrls: ['./group-preview.component.scss']
})
export class GroupPreviewComponent implements OnInit, OnDestroy {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() applications: Readonly<number>

    @Output() schedulePreviewEmitter: EventEmitter<SchedulePreview>

    private headerTitle: string
    private scheduleEntries: ScheduleEntryLike[]
    private subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly scheduleService: ScheduleEntryService
    ) {
        this.schedulePreviewEmitter = new EventEmitter<SchedulePreview>()
        this.subs = []
        this.scheduleEntries = []
    }

    ngOnInit() {
        console.log('group preview component loaded')

        this.headerTitle = `Gruppen-Vorschau für ${this.labwork.label}`
    }

    ngOnDestroy = () => this.subs.forEach(s => s.unsubscribe())

    private canPreview = () => {
        return true // TODO permission check
    }

    private onPreview = () => {
        const preview$ = openDialog(
            GroupPreviewModalComponent.instance(this.dialog, this.applications),
            fetchPreview(this.scheduleService, this.labwork)
        )

        this.subs.push(subscribe(preview$, p => {
            this.schedulePreviewEmitter.emit(p)
            this.scheduleEntries = p.schedule.entries
        }))
    }
}
