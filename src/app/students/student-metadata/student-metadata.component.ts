import {Component, Input} from '@angular/core'
import {StudentAtom} from '../../models/user.model'
import {formatUser} from '../../utils/component.utils'

@Component({
    selector: 'lwm-student-metadata',
    templateUrl: './student-metadata.component.html',
    styleUrls: ['./student-metadata.component.scss']
})
export class StudentMetadataComponent {

    @Input() student: StudentAtom

    title = () =>
        formatUser(this.student)

    mailtoUrl = () =>
        `mailto:${this.student.email}`

    mailAddress = () =>
        this.student.email

    enrollmentLabel = () =>
        this.student.enrollment.label
}
