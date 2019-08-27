import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { FormPayload } from '../shared-dialogs/create-update/create-update-dialog.component';
import { CourseAtom } from '../models/course.model';
import { AuthorityService } from '../services/authority.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { AlertService } from '../services/alert.service';
import { TableHeaderColumn } from '../abstract-crud/abstract-crud.component';
import { AuthorityAtom, AuthorityProtocol } from '../models/authority.model';
import { Subscription, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Role, UserRole } from '../models/role.model';
import { mandatoryOptionsValidator, invalidChoiceKey, isUserInput } from '../utils/form.validator';
import { subscribe } from '../utils/functions';
import { UserStatus } from '../models/userStatus.model';
import { startWith, map } from 'rxjs/operators';
import { addToDataSource } from '../shared-dialogs/dataSource.update';
import { resetControls } from '../utils/component.utils';

type AuthCreationControl = 'userControl' | 'roleControl'

@Component({
    selector: 'lwm-course-authority-dialog',
    templateUrl: './course-authority-dialog.component.html',
    styleUrls: ['./course-authority-dialog.component.scss']
})
export class CourseAuthorityUpdateDialogComponent implements OnInit, OnDestroy {

    constructor(
        private dialogRef: MatDialogRef<CourseAuthorityUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private course: CourseAtom,
        private authorityService: AuthorityService,
        private userService: UserService,
        private roleService: RoleService,
        private alertService: AlertService
    ) {
        this.displayedColumns = ['user', 'role', 'action']
        this.columns = [{ attr: 'user', title: 'Nutzer' }, { attr: 'role', title: 'Rolle' }]
        this.subs = []

        this.authGroup = new FormGroup({})
        this.userOptions = []
        this.roleOptions = []
    }


    protected readonly displayedColumns: string[]
    protected readonly columns: TableHeaderColumn[]

    private readonly dataSource = new MatTableDataSource<AuthorityAtom>()
    private readonly subs: Subscription[]

    protected readonly authGroup: FormGroup
    protected userOptions: User[]
    protected roleOptions: Role[]
    protected filteredUserOptions: Observable<User[]>
    protected filteredRoleOptions: Observable<Role[]>

    static instance(dialog: MatDialog, course: CourseAtom): MatDialogRef<CourseAuthorityUpdateDialogComponent> {
        return dialog.open(CourseAuthorityUpdateDialogComponent, {
            data: course,
            panelClass: 'lwmCourseAuthorityUpdateDialog'
        })
    }
    private addControl(controlName: AuthCreationControl) { // TODO move out
        this.authGroup.addControl(controlName, new FormControl('', mandatoryOptionsValidator()))
    }

    private getControl(control: AuthCreationControl): AbstractControl { // TODO move out
        return this.authGroup.controls[control]
    }

    private hasFormGroupError(control: AuthCreationControl): boolean { // TODO move out
        return this.getControl(control).hasError(invalidChoiceKey)
    }

    private formGroupErrorMessage(control: AuthCreationControl) { // TODO move out
        return this.getControl(control).getError(invalidChoiceKey)
    }

    ngOnInit() {
        this.setupAuthorities()
        this.setupRoles()
        this.setupUsers()
        this.setupFormControls()
    }

    private setupUsers() {
        this.subs.push(subscribe(
            this.userService.getAll(),
            users => this.userOptions = users
        ))
    }

    private setupRoles() {
        this.subs.push(subscribe(
            this.roleService.getCourseRoles(),
            roles => this.roleOptions = roles
        ))
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
        this.addControl('userControl')
        this.addControl('roleControl')

        this.filteredUserOptions = this.getControl('userControl').valueChanges
            .pipe(
                startWith(''),
                map(value => isUserInput(value) ? value : value.lastname),
                map(name => name ? this.filterUser(name) : this.userOptions.slice())
            )

        this.filteredRoleOptions = this.getControl('roleControl').valueChanges
            .pipe(
                startWith(''),
                map(value => isUserInput(value) ? value : value.label),
                map(label => label ? this.filterRole(label) : this.roleOptions.slice())
            )
    }

    private displayFn(object?: User | Role): string | undefined {
        const isUser = (o: User | Role): o is User => {
            return (object as User).lastname !== undefined
        }

        if (!object) {
            return undefined
        }

        if (isUser(object)) {
            return `${object.lastname}, ${object.firstname} (${object.systemId})`
        } else {
            return object.label
        }
    }

    private filterUser(input: string): User[] {
        const filterValue = input.toLowerCase()
        return this.userOptions.filter(user => user.lastname.toLowerCase().indexOf(filterValue) === 0)
    }

    private filterRole(input: string): Role[] {
        const filterValue = input.toLowerCase()
        return this.roleOptions.filter(role => role.label.toLowerCase().indexOf(filterValue) === 0)
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    addAuthority() {
        if (!this.authGroup.valid) {
            return
        }

        const role = this.getControl('roleControl').value as Role
        const user = this.getControl('userControl').value as User
        this.createAuthority({ user: user.id, role: role.id, course: this.course.id })
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
        const controls: AuthCreationControl[] = ['roleControl', 'userControl']
        resetControls(controls.map(this.getControl.bind(this)))
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
        this.dataSource.data = this.dataSource.data.filter(a => a.id !== auth.id)
        this.alertService.reportAlert('success', 'deleted: ' + JSON.stringify(auth))
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
        return this.fold(attr, auth, user => {
            return `${user.lastname}, ${user.firstname}`
        }, role => {
            return auth.role.label
        })
    }

    private closeModal(result: AuthorityProtocol | undefined) {
        this.dialogRef.close(result)
    }

    employeeCount(): number {
        return this.dataSource.data.filter(auth => auth.role.label !== UserRole.courseAssistant).length
    }


    studentCount(): number {
        return this.dataSource.data.filter(auth => auth.role.label === UserRole.courseAssistant).length
    }
}
