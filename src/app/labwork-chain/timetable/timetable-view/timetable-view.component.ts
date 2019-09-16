import {Component, Input} from '@angular/core'
import {LabworkAtom} from '../../../models/labwork.model'
import {TimetableAtom} from '../../../models/timetable'

@Component({
    selector: 'lwm-timetable-view',
    templateUrl: './timetable-view.component.html',
    styleUrls: ['./timetable-view.component.scss']
})
export class TimetableViewComponent {
    @Input() labwork: Readonly<LabworkAtom>
    @Input() timetable: Readonly<TimetableAtom>
}
