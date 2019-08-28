import { Component, Input, OnDestroy } from '@angular/core'
import { CourseAtom } from '../models/course.model'
import { MatDialog } from '@angular/material'
import { DialogMode, dialogSubmitTitle, dialogTitle } from '../shared-dialogs/dialog.mode'
import {CreateUpdateDialogComponent, FormPayload} from '../shared-dialogs/create-update/create-update-dialog.component'
import { courseFormInputData, getInitials, updateCourse } from '../utils/component.utils'
import { UserService } from '../services/user.service'
import { Subscription } from 'rxjs'
import { subscribe } from '../utils/functions'
import { CourseProtocol, CourseService } from '../services/course.service'
import { AlertService } from '../services/alert.service'
import { CourseAuthorityUpdateDialogComponent } from '../course-authority-dialog/course-authority-dialog.component';

@Component({
    selector: 'lwm-course-detail',
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnDestroy {

    @Input() course: CourseAtom

    private readonly subs: Subscription[]

    constructor(
        private readonly dialog: MatDialog,
        private readonly userService: UserService,
        private readonly courseService: CourseService,
        private readonly alertService: AlertService
    ) {
        this.subs = []
    }

    getInitials_(): string {
        return getInitials(this.course.lecturer)
    }

    editAuthorites() {
        const dialogRef = CourseAuthorityUpdateDialogComponent.instance(this.dialog, this.course)
    }

    onEdit() {
        const inputData = courseFormInputData(this.userService)(this.course, true)
        const mode = DialogMode.edit

        const payload = {
            headerTitle: dialogTitle(mode, 'Modul'),
            submitTitle: dialogSubmitTitle(mode),
            data: inputData,
            makeProtocol: output => updateCourse(this.course, output)
        }

        const dialogRef = CreateUpdateDialogComponent.instance(this.dialog, payload)
        const s = subscribe(dialogRef.afterClosed(), this.edit.bind(this))
        this.subs.push(s)
    }

    edit(courseProtocol: CourseProtocol) {
        const s = subscribe(this.courseService.update(courseProtocol, this.course.id), this.afterEdit.bind(this))
        this.subs.push(s)
    }

    afterEdit(updatedCourse: CourseAtom) {
        this.course = updatedCourse
        this.alertService.reportAlert('success', `updated ${JSON.stringify(updatedCourse)}`)
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }
}
