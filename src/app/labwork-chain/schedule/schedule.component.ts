import {Component, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'
import {ScheduleEntryAtom} from '../../models/schedule-entry.model'
import {makeScheduleEntryEvents, ScheduleEntryEvent} from './schedule-view-model'
import {TimetableAtom} from '../../models/timetable'

@Component({
    selector: 'lwm-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>
    @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>
    @Input() timetable: Readonly<TimetableAtom>

    private dates: ScheduleEntryEvent[]
    private headerTitle: string

    ngOnInit() {
        console.log('schedule component loaded')

        this.headerTitle = `Staffelplan für ${this.labwork.label}`
        this.updateCalendar(this.scheduleEntries)
    }

    private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryAtom[]>) => {
        console.log('updating schedule cal')
        this.dates = makeScheduleEntryEvents(scheduleEntries)
    }
}
