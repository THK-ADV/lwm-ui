import {Component, Input} from '@angular/core'
import {Group} from '../../models/group.model'
import {format, formatTime} from '../../utils/lwmdate-adapter'
import {Card} from '../../card-list/card-list.component'
import {Time} from '../../models/time.model'
import {_groupBy, dateOrderingASC} from '../../utils/functions'

export interface ScheduleEntryLike {
    group: Group
    date: Date
    start: Time
    end: Time
}

@Component({
    selector: 'lwm-abstract-group-view',
    templateUrl: './abstract-group-view.component.html',
    styleUrls: ['./abstract-group-view.component.scss']
})
export class AbstractGroupViewComponent {

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
                    entries: es.sort((lhs, rhs) => dateOrderingASC(lhs.date, rhs.date))
                }
            })
            .sort((lhs, rhs) => lhs.value.label.localeCompare(rhs.value.label))
    }
}
