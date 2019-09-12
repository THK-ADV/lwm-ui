import {Component, Input} from '@angular/core'
import {Group} from '../../models/group.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {Card} from '../../card-list/card-list.component'
import {Time} from '../../models/time.model'
import {_groupBy} from '../../utils/functions'

export interface ScheduleEntryLike {
    group: Group
    date: Date
    start: Time
    end: Time
}

@Component({
    selector: 'lwm-group-card-view',
    templateUrl: './group-card-view.component.html',
    styleUrls: ['./group-card-view.component.scss']
})
export class GroupCardViewComponent {

    @Input() set entries(entries: ScheduleEntryLike[]) {
        this.groups = this.toCardGroups(entries)
    }

    private groups: Card<Group, ScheduleEntryLike>[]

    private cardTitle = (group: Group) => `${group.label} - ${group.members.length} Teilnehmer`

    private canEdit = () => false

    private onEdit = (group: Group) => {
    }

    private displayDate = (e: ScheduleEntryLike) => format(e.date, 'dd.MM.yyyy')

    private displayTime = (e: ScheduleEntryLike) => `${formatTime(e.start, 'HH:mm')} - ${formatTime(e.end, 'HH:mm')}`

    private toCardGroups = (entries: Readonly<ScheduleEntryLike[]>): Card<Group, ScheduleEntryLike>[] => {
        return Object
            .entries(_groupBy(entries, x => x.group.id))
            .map(([_, value]) => {
                const es = value as ScheduleEntryLike[]

                return {
                    value: es[0].group,
                    entries: es.sort((lhs, rhs) => lhs.date.getTime() - rhs.date.getTime())
                }
            })
            .sort((lhs, rhs) => lhs.value.label.localeCompare(rhs.value.label))
    }
}
