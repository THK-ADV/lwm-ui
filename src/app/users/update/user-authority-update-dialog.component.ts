import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort, MatTableDataSource, Sort, SortDirection} from '@angular/material'
import {DIALOG_WIDTH} from '../../shared-dialogs/dialog-constants'
import {User} from '../../models/user.model'
import {AuthorityService, UserStatus} from '../../services/authority.service'
import {AuthorityAtom} from '../../models/authorityAtom.model'
import {Subscription} from 'rxjs'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'

export interface StandardRole {
    label: UserStatus
    color: 'primary' | 'accent'
}

@Component({
    selector: 'app-user-edit-dialog',
    templateUrl: './user-authority-update-dialog.component.html',
    styleUrls: ['./user-authority-update-dialog.component.scss']
})
export class UserAuthorityUpdateDialogComponent implements OnInit, OnDestroy {

    standardRoles: StandardRole[]
    protected dataSource = new MatTableDataSource<AuthorityAtom>()
    private readonly displayedColumns: string[]
    columns: TableHeaderColumn[]
    @ViewChild(MatSort, {static: true}) sort: MatSort

    sub: Subscription

    static instance(dialog: MatDialog, user: User): MatDialogRef<UserAuthorityUpdateDialogComponent> {
        return dialog.open(UserAuthorityUpdateDialogComponent, {
            width: DIALOG_WIDTH,
            data: user,
            panelClass: 'lwmUserAuthorityUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<UserAuthorityUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private user: User,
        private authorityService: AuthorityService
    ) {
        this.standardRoles = []
        this.displayedColumns = ['course', 'role', 'action']
        this.columns = [{attr: 'course', title: 'Modul'}, {attr: 'role', title: 'Rolle'}]
    }

    ngOnInit() {
        this.dataSource.sortingDataAccessor = (auth, attr) => {
            return this.fold(
                attr,
                auth,
                course => course.abbreviation,
                role => role.label
            )
        }

        this.dataSource.sort = this.sort

        this.sub = this.authorityService.getAuthorities(this.user.systemId).subscribe(auths => {
            if (this.authorityService.isAdmin(auths)) {
                this.standardRoles.push({label: 'Administrator', color: 'accent'})
            }

            if (this.authorityService.hasStatus('Mitarbeiter', auths)) {
                this.standardRoles.push({label: 'Mitarbeiter', color: 'primary'})
            }

            if (this.authorityService.hasStatus('Student', auths)) {
                this.standardRoles.push({label: 'Student', color: 'primary'})
            }

            this.dataSource.data = auths.filter(auth => auth.course !== undefined)

            if (this.dataSource.data.length !== 0) {
                this.sortBy('course')
            }
        })
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }

    protected sortBy(label: string, ordering: SortDirection = 'asc') { // copy pasted
        if (this.sort) {
            const sortState: Sort = {active: label, direction: ordering}
            this.sort.active = sortState.active
            this.sort.direction = sortState.direction
            this.sort.sortChange.emit(sortState)
        }
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    onDelete(auth: AuthorityAtom) {
        console.log('onDelete', auth)
    }

    private headerTitle(): string {
        return `${this.user.lastname}, ${this.user.firstname} (${this.user.systemId})`
    }

    private fold(attr: string, auth: AuthorityAtom, mapCourse: (CourseAtom) => string, mapRole: (Role) => string): string {
        switch (attr) {
            case 'course':
                return mapCourse(auth.course!!)
            case 'role':
                return mapRole(auth.role)
            default:
                return '???'
        }
    }

    private emptyData(): boolean {
        return this.dataSource.data.length === 0
    }

    private prepareTableContent(auth: AuthorityAtom, attr: string): string {
        return this.fold(attr, auth, course => {
            const abbrev = course.abbreviation
            const lec = course.lecturer.lastname
            return `${abbrev} (${lec})`
        }, role => {
            return auth.role.label
        })
    }

    private closeModal(result: any | undefined) {
        this.dialogRef.close(result)
    }
}
