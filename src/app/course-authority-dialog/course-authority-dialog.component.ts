import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {FormControl, FormGroup} from '@angular/forms'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {CourseAtom} from '../models/course.model'
import {AuthorityService} from '../services/authority.service'
import {UserService} from '../services/user.service'
import {RoleService} from '../services/role.service'
import {AlertService} from '../services/alert.service'
import {TableHeaderColumn} from '../abstract-crud/abstract-crud.component'
import {AuthorityAtom, AuthorityProtocol} from '../models/authority.model'
import {Subscription} from 'rxjs'
import {User} from '../models/user.model'
import {Role, UserRole} from '../models/role.model'
import {invalidChoiceKey} from '../utils/form.validator'
import {count, subscribe} from '../utils/functions'
import {addToDataSource, removeFromDataSource} from '../shared-dialogs/dataSource.update'
import {emptyAuthorityProtocol, foreachOption, formatUser, isOption, resetControl} from '../utils/component.utils'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {FormInput} from '../shared-dialogs/forms/form.input'
import {isRole, isUser} from '../utils/type.check.utils'

@Component({
    selector: 'lwm-course-authority-dialog',
    templateUrl: './course-authority-dialog.component.html',
    styleUrls: ['./course-authority-dialog.component.scss']
})
export class CourseAuthorityUpdateDialogComponent implements OnInit, OnDestroy {

    protected readonly displayedColumns: string[]
    protected readonly columns: TableHeaderColumn[]

    private readonly dataSource = new MatTableDataSource<AuthorityAtom>()
    private readonly subs: Subscription[]

    protected readonly authGroup: FormGroup
    protected inputs: FormInput[]

    constructor(
        private dialogRef: MatDialogRef<CourseAuthorityUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private course: CourseAtom,
        private authorityService: AuthorityService,
        private userService: UserService,
        private roleService: RoleService,
        private alertService: AlertService
    ) {
        this.displayedColumns = ['user', 'role', 'action']
        this.columns = [{attr: 'user', title: 'Nutzer'}, {attr: 'role', title: 'Rolle'}]
        this.subs = []

        this.authGroup = new FormGroup({})
        this.inputs = []
    }

    static instance(dialog: MatDialog, course: CourseAtom): MatDialogRef<CourseAuthorityUpdateDialogComponent> {
        return dialog.open(CourseAuthorityUpdateDialogComponent, {
            data: course,
            panelClass: 'lwmCourseAuthorityUpdateDialog'
        })
    }

    ngOnInit() {
        this.setupAuthorities()
        const roleOption = this.roleFormInput()
        const userOption = this.userFormInput()

        this.inputs = [userOption, roleOption]
        this.setupFormControls()
    }

    private userFormInput(): FormInput {
        const fcn = 'userControl'
        return {
            formControlName: fcn,
            displayTitle: 'Nutzer',
            isDisabled: false,
            data: new FormInputOption<User>(fcn, invalidChoiceKey, true, formatUser, this.userService.getAll())
        }
    }

    private roleFormInput(): FormInput {
        const fcn = 'roleControl'
        return {
            formControlName: fcn,
            displayTitle: 'Rolle',
            isDisabled: false,
            data: new FormInputOption<Role>(fcn, invalidChoiceKey, true, r => r.label, this.roleService.getCourseRoles())
        }
    }

    private setupAuthorities() {
        this.subs.push(subscribe(
            this.authorityService.getAuthoritiesForCourse(this.course.id),
            auths => {
                this.dataSource.data = auths

                if (this.dataSource.data.length !== 0) {
                    this.dataSource.data.sort((lhs, rhs) => lhs.user.lastname.localeCompare(rhs.user.lastname))
                }
            }
        ))
    }

    private setupFormControls() {
        foreachOption(this.inputs, o => {
            const fc = new FormControl(o.value, o.validator)
            this.authGroup.addControl(o.controlName, fc)

            o.onInit(this.authGroup)
        })
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
        foreachOption(this.inputs, o => o.onDestroy())
    }

    onCancel(): void {
        this.dialogRef.close()
    }

    addAuthority() {
        if (!this.authGroup.valid) {
            return
        }

        const protocol = emptyAuthorityProtocol()
        protocol.course = this.course.id

        this.inputs.reduce((p, input) => {
            if (isOption(input.data)) {
                if (isRole(input.data.control.value)) {
                    p.role = input.data.control.value.id
                } else if (isUser(input.data.control.value)) {
                    p.user = input.data.control.value.id
                }
            }

            return p
        }, protocol)

        this.createAuthority(protocol)
    }

    private createAuthority(auth: AuthorityProtocol) {
        this.subs.push(
            subscribe(
                this.authorityService.createMany(auth),
                this.afterCreate.bind(this)
            )
        )
    }

    private afterCreate(auths: AuthorityAtom[]) {
        addToDataSource(this.dataSource, this.alertService)(auths)
        foreachOption(this.inputs, o => resetControl(o.control))
    }

    onDelete(auth: AuthorityAtom) {
        this.subs.push(
            subscribe(
                this.authorityService.delete(auth.id),
                _ => this.afterDelete(auth)
            )
        )
    }

    private afterDelete(auth: AuthorityAtom) {
        removeFromDataSource(this.dataSource, this.alertService)(a => a.id === auth.id)
    }

    private headerTitle(): string {
        return `${this.course.abbreviation}`
    }

    private emptyData(): boolean {
        return this.dataSource.data.length === 0
    }

    private fold(attr: string, auth: AuthorityAtom, mapUser: (User) => string, mapRole: (Role) => string): string {
        switch (attr) {
            case 'user':
                return mapUser(auth.user)
            case 'role':
                return mapRole(auth.role)
            default:
                return '???'
        }
    }

    private prepareTableContent(auth: AuthorityAtom, attr: string): string {
        return this.fold(attr, auth,
            user => formatUser(user),
            role => role.label
        )
    }

    employeeCount(): number {
        return count(this.dataSource.data, auth => auth.role.label !== UserRole.courseAssistant)
    }

    studentCount(): number {
        return count(this.dataSource.data, auth => auth.role.label === UserRole.courseAssistant)
    }
}
