import {Component, EventEmitter, Input, Output} from '@angular/core'
import {colorForCourse} from '../../utils/course-colors'
import {CourseAtom} from '../../models/course.model'

interface LegendViewItem {
    label: string
    color: string
    course: CourseAtom
}

@Component({
    selector: 'lwm-dashboard-cal-legend',
    templateUrl: './dashboard-cal-legend.component.html',
    styleUrls: ['./dashboard-cal-legend.component.scss'],
    standalone: false
})
export class DashboardCalLegendComponent {

    @Input() title: string

    @Input() set courses(courses: CourseAtom[]) {
        this.legendViewItems = courses.map(c => ({
            label: c.abbreviation,
            color: colorForCourse(c.id),
            course: c
        }))
    }

    @Output() legendClicked = new EventEmitter<CourseAtom>()

    legendViewItems: LegendViewItem[]

    onClick = (l: LegendViewItem) =>
        this.legendClicked.emit(l.course)
}
