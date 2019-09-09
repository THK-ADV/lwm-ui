import {Component, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {ScheduleEntryService} from '../../services/schedule-entry.service'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {Card} from '../../card-list/card-list.component'
import {Group} from '../../models/group.model'
import {_groupBy} from '../../utils/functions'
import {format, formatTime} from '../../utils/lwmdate-adapter'

@Component({
    selector: 'lwm-group-preview',
    templateUrl: './group-preview.component.html',
    styleUrls: ['./group-preview.component.scss']
})
export class GroupPreviewComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>

    private headerTitle: string
    private groups: Card<Group, ScheduleEntryAtom>[]

    constructor(
        private readonly scheduleEntryService: ScheduleEntryService
    ) {
        this.groups = []
    }

    ngOnInit() {
        console.log('group component loaded')

        this.headerTitle = `Gruppen-Vorschau für ${this.labwork.label}`
        this.updateDataSource(this.scheduleEntries)
    }

    private updateDataSource = (scheduleEntries: Readonly<ScheduleEntryAtom[]>) => {
        console.log('updating groups')

        this.scheduleEntries = scheduleEntries
        // this.timetableUpdate.emit(t)

        this.groups = Object
            .entries(_groupBy(this.scheduleEntries, x => x.group.id))
            .map(([_, value]) => {
                const entries = value as ScheduleEntryAtom[]

                return {
                    value: entries[0].group,
                    entries: entries.sort((lhs, rhs) => lhs.date.getTime() - rhs.date.getTime())
                }
            })
            .sort((lhs, rhs) => lhs.value.label.localeCompare(rhs.value.label))
    }

    private canPreview = () => {
        return true // TODO permission check
    }

    private onPreview = () => {
        // TODO
    }

    private cardTitle = (group: Group) => `${group.label} - ${group.members.length} Teilnehmer`

    private canEdit = () => false

    private onEdit = (group: Group) => {
    }

    private displayDate = (e: ScheduleEntryAtom) => format(e.date, 'dd.MM.yyyy')

    private displayTime = (e: ScheduleEntryAtom) => `${formatTime(e.start, 'HH:mm')} - ${formatTime(e.end, 'HH:mm')}`
}
