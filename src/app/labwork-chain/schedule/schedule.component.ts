import {Component, Input, OnInit} from '@angular/core'
import {LabworkAtom} from '../../models/labwork.model'

@Component({
    selector: 'lwm-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

    @Input() labwork: Readonly<LabworkAtom>

    constructor() {
    }

    ngOnInit() {
    }

}
