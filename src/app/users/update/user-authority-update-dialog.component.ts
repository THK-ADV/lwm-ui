import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material'
import {User} from '../../models/user.model'
import {AuthorityService} from '../../services/authority.service'
import {AuthorityAtom, AuthorityProtocol} from '../../models/authority.model'
import {Observable, Subscription} from 'rxjs'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {CourseAtom} from '../../models/course.model'
import {CourseService} from '../../services/course.service'
import {subscribe} from '../../utils/functions'
import {map, startWith} from 'rxjs/operators'
import {RoleService} from '../../services/role.service'
import {Role, UserRole} from '../../models/role.model'
import {AlertService} from '../../services/alert.service'
import {invalidChoiceKey, isUserInput, mandatoryOptionsValidator} from '../../utils/form.validator'
import {addToDataSource} from '../../shared-dialogs/dataSource.update'
import {resetControls} from '../../utils/form-control-utils'
import {LWMColor} from '../../utils/colors'
import {hasRole} from '../../utils/role-checker'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'

export interface StandardRole {
    label: UserRole
    color: LWMColor
}

type AuthCreationControl = 'courseControl' | 'roleControl'

@Component({
    selector: 'app-user-edit-dialog',
    templateUrl: './user-authority-update-dialog.component.html',
    styleUrls: ['./user-authority-update-dialog.component.scss']
})
export class UserAuthorityUpdateDialogComponent implements OnInit, OnDestroy { // TODO apply same refactoring as in CourseAuthorityUpdateDialogComponent

    constructor(
        private dialogRef: MatDialogRef<UserAuthorityUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private user: User,
        private authorityService: AuthorityService,
        private courseService: CourseService,
        private roleService: RoleService,
        private alertService: AlertService
    ) {
        this.standardRoles = []
        this.displayedColumns = ['course', 'role', 'action']
        this.columns = [{attr: 'course', title: 'Modul'}, {attr: 'role', title: 'Rolle'}]
        this.subs = []

        this.authGroup = new FormGroup({})
        this.courseOptions = []
        this.roleOptions = []
    }

    readonly standardRoles: StandardRole[]
    readonly displayedColumns: string[]
    readonly columns: TableHeaderColumn[]

    readonly dataSource = new MatTableDataSource<AuthorityAtom>()
    private readonly subs: Subscription[]

    readonly authGroup: FormGroup
    courseOptions: CourseAtom[]
    roleOptions: Role[]
    filteredCourseOptions: Observable<CourseAtom[]>
    filteredRoleOptions: Observable<Role[]>

    static instance(dialog: MatDialog, user: User): MatDialogRef<UserAuthorityUpdateDialogComponent> {
        return dialog.open(UserAuthorityUpdateDialogComponent, {
            data: user,
            panelClass: 'lwmUserAuthorityUpdateDialog'
        })
    }

    private addControl = (controlName: AuthCreationControl) => { // TODO move out
        this.authGroup.addControl(controlName, new FormControl('', mandatoryOptionsValidator()))
    }

    private getControl = (control: AuthCreationControl): AbstractControl => { // TODO move out
        return this.authGroup.controls[control]
    }

    ngOnInit() {
        this.setupAuthorities()
        this.setupRoles()
        this.setupCourses()
        this.setupFormControls()
    }

    hasFormGroupError = (control: AuthCreationControl): boolean => { // TODO move out
        return this.getControl(control).hasError(invalidChoiceKey)
    }

    formGroupErrorMessage = (control: AuthCreationControl) => { // TODO move out
        return this.getControl(control).getError(invalidChoiceKey)
    }

    private setupCourses = () => {
        this.subs.push(subscribe(
            this.courseService.getAll(),
            courses => this.courseOptions = courses
        ))
    }

    private setupRoles = () => {
        this.subs.push(subscribe(
            this.roleService.getCourseRoles(),
            roles => this.roleOptions = roles
        ))
    }

    private setupAuthorities = () => {
        this.subs.push(subscribe(
            this.authorityService.getAuthorities(this.user.systemId),
            auths => {
                auths.forEach(auth => {
                    if (hasRole(UserRole.admin, auth)) {
                        this.standardRoles.push({label: UserRole.admin, color: 'accent'})
                    }

                    if (hasRole(UserRole.employee, auth)) {
                        this.standardRoles.push({label: UserRole.employee, color: 'primary'})
                    }

                    if (hasRole(UserRole.student, auth)) {
                        this.standardRoles.push({label: UserRole.student, color: 'primary'})
                    }

                    if (auth.course !== undefined) {
                        this.dataSource.data.push(auth)
                    }
                })

                if (this.dataSource.data.length !== 0) {
                    // tslint:disable-next-line:no-non-null-assertion
                    this.dataSource.data.sort((lhs, rhs) => lhs.course!.abbreviation.localeCompare(rhs.course!.abbreviation))
                }
            }
        ))
    }

    private setupFormControls = () => {
        this.addControl('courseControl')
        this.addControl('roleControl')

        this.filteredCourseOptions = this.getControl('courseControl').valueChanges
            .pipe(
                startWith(''),
                map(value => isUserInput(value) ? value : value.abbreviation),
                map(abbreviation => abbreviation ? this.filterCourse(abbreviation) : this.courseOptions.slice())
            )

        this.filteredRoleOptions = this.getControl('roleControl').valueChanges
            .pipe(
                startWith(''),
                map(value => isUserInput(value) ? value : value.label),
                map(label => label ? this.filterRole(label) : this.roleOptions.slice())
            )
    }

    displayFn = (object?: CourseAtom | Role): string | undefined => {
        const isCourse = (o: CourseAtom | Role): o is CourseAtom => {
            return (object as CourseAtom).semesterIndex !== undefined
        }

        if (!object) {
            return undefined
        }

        if (isCourse(object)) {
            return `${object.abbreviation} (${object.lecturer.lastname})`
        } else {
            return object.label
        }
    }

    private filterCourse = (input: string): CourseAtom[] => {
        const filterValue = input.toLowerCase()
        return this.courseOptions.filter(course => course.abbreviation.toLowerCase().indexOf(filterValue) === 0)
    }

    private filterRole = (input: string): Role[] => {
        const filterValue = input.toLowerCase()
        return this.roleOptions.filter(role => role.label.toLowerCase().indexOf(filterValue) === 0)
    }


    ngOnDestroy = (): void => {
        this.subs.forEach(s => s.unsubscribe())
    }

    onCancel = (): void => {
        this.closeModal(undefined)
    }

    addAuthority = () => {
        if (!this.authGroup.valid) {
            return
        }

        const role = this.getControl('roleControl').value as Role
        const courseAtom = this.getControl('courseControl').value as CourseAtom
        this.createAuthority({user: this.user.id, role: role.id, course: courseAtom.id})
    }

    private createAuthority = (auth: AuthorityProtocol) => {
        this.subs.push(
            subscribe(
                this.authorityService.create(auth),
                this.afterCreate.bind(this)
            )
        )
    }

    protected afterCreate = (auth: AuthorityAtom) => {
        addToDataSource(this.dataSource, this.alertService)(auth)
        const controls: AuthCreationControl[] = ['roleControl', 'courseControl']
        resetControls(controls.map(this.getControl.bind(this)))
    }

    onDelete = (auth: AuthorityAtom) => {
        this.subs.push(
            subscribe(
                this.authorityService.delete(auth.id),
                _ => this.afterDelete(auth)
            )
        )
    }

    private afterDelete = (auth: AuthorityAtom) => {
        this.dataSource.data = this.dataSource.data.filter(a => a.id !== auth.id)
        this.alertService.reportSuccess('deleted: ' + JSON.stringify(auth))
    }

    headerTitle = (): string =>
        `${this.user.lastname}, ${this.user.firstname} (${this.user.systemId})`

    private fold(attr: string, auth: AuthorityAtom, mapCourse: (CourseAtom) => string, mapRole: (Role) => string): string {
        switch (attr) {
            case 'course':
                // tslint:disable-next-line:no-non-null-assertion
                return mapCourse(auth!.course)
            case 'role':
                return mapRole(auth.role)
            default:
                return '???'
        }
    }

    emptyData = (): boolean => this.dataSource.data.length === 0

    prepareTableContent = (auth: AuthorityAtom, attr: string): string =>
        this.fold(attr, auth, course => {
            const abbrev = course.abbreviation
            const lec = course.lecturer.lastname
            return `${abbrev} (${lec})`
        }, role => {
            return auth.role.label
        })

    closeModal = (result: AuthorityProtocol | undefined) =>
        this.dialogRef.close(result)
}
