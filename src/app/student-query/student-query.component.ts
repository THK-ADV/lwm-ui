import {Component, OnInit} from '@angular/core'
import {Observable} from 'rxjs'
import {StudentAtom} from '../models/user.model'
import {Single} from './query-engine'

@Component({
    selector: 'lwm-student-query',
    templateUrl: './student-query.component.html',
    styleUrls: ['./student-query.component.scss']
})
export class StudentQueryComponent implements OnInit {

    students: Observable<StudentAtom[]>

    criteria: Single[] = []
    currentCriteria = ''
    currentValue = ''

    ngOnInit(): void {
    }

    add = () => {
        if (!(this.currentCriteria && this.currentValue)) {
            return
        }

        this.criteria.push({kind: 'single', key: this.currentCriteria, value: this.currentValue})
        this.currentCriteria = ''
        this.currentValue = ''
    }

    remove = (criteria: Single) => {
        const idx = this.criteria.indexOf(criteria)
        if (idx >= 0) {
            this.criteria.splice(idx, 1)
        }
    }

    show = (c: Single) =>
        `${c.key}: ${c.value}`

    validCriteria = () =>
        this.currentCriteria && this.currentValue
}
