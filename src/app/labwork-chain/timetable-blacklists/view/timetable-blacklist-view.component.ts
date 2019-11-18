import {Component, Input} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {TimetableAtom} from '../../../models/timetable'

@Component({
    selector: 'lwm-timetable-blacklist-view',
    templateUrl: './timetable-blacklist-view.component.html',
    styleUrls: ['./timetable-blacklist-view.component.scss']
})
export class TimetableBlacklistViewComponent {
    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
}
