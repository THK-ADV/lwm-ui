import {Component, OnDestroy, OnInit} from '@angular/core'
import {AbstractControl, FormControl, FormGroup} from '@angular/forms'
import {MatDialog} from '@angular/material/dialog'
import {MatTableDataSource} from '@angular/material/table'
import {GroupAtom} from '../../models/group.model'
import {EMPTY, Observable, of, Subscription, zip} from 'rxjs'
import {User} from '../../models/user.model'
import {FormInputOption} from '../../shared-dialogs/forms/form.input.option'
import {exists, partition, subscribe} from '../../utils/functions'
import {FormInput} from '../../shared-dialogs/forms/form.input'
import {map, switchMap, tap} from 'rxjs/operators'
import {createAction, deleteAction, fireAction, honorAction, LWMAction, swapAction} from '../../table-action-button/lwm-actions'
import {TableHeaderColumn} from '../../abstract-crud/abstract-crud.component'
import {ActivatedRoute} from '@angular/router'
import {GroupService} from '../../services/group.service'
import {UserService} from '../../services/user.service'
import {invalidChoiceKey} from '../../utils/form.validator'
import {formatUser} from '../../utils/component.utils'
import {
    ExplicitEvaluationKind,
    GroupDeletionResult,
    GroupInsertionResult,
    GroupMovementResult,
    LwmService
} from '../../services/lwm.service'
import {addToDataSource, removeFromDataSource} from '../../shared-dialogs/dataSource.update'
import {isOption, resetControl} from '../../utils/form-control-utils'
import {AlertService} from '../../services/alert.service'
import {ConfirmationResult, ConfirmDialogComponent} from '../../shared-dialogs/confirm-dialog/confirm-dialog.component'
import {openDialog} from '../../shared-dialogs/dialog-open-combinator'

@Component({
    selector: 'lwm-group-edit',
    templateUrl: './group-edit.component.html',
    styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit, OnDestroy { // TODO apply assignment index changes

    private subs: Subscription[]

    // UI

    dataSource: MatTableDataSource<User>
    title: string

    readonly displayedColumns: string[]
    readonly columns: TableHeaderColumn[]

    readonly addAction: LWMAction
    readonly deleteAction: LWMAction
    readonly swapAction: LWMAction
    readonly fireAction: LWMAction
    readonly honorAction: LWMAction

    readonly addStudentFormGroup: FormGroup
    addStudentForm: FormInput
    studentOption: FormInputOption<User>

    // Data

    labworkId: string
    courseId: string
    groupLabel: string
    groupId: string
    otherGroups: GroupAtom[]
    fellowStudents$: Observable<User[]>

    constructor(
        private readonly route: ActivatedRoute,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
        private readonly lwmService: LwmService,
        private readonly alertService: AlertService,
        private readonly dialog: MatDialog,
    ) {
        this.subs = []
        this.dataSource = new MatTableDataSource()
        this.columns = [
            {attr: 'index', title: '#'},
            {attr: 'name', title: 'Name, Vorname'},
            {attr: 'systemId', title: 'GMID'}
        ]
        this.displayedColumns = this.columns.map(c => c.attr).concat('action')
        this.deleteAction = deleteAction()
        this.swapAction = swapAction()
        this.addAction = createAction()
        this.fireAction = fireAction()
        this.honorAction = honorAction()
        this.addStudentFormGroup = new FormGroup({})
    }


    ngOnInit() {
        this.subs.push(
            subscribe(this.fetchGroupsAndStudents(), this.updateUI)
        )
    }

    private fetchGroupsAndStudents = (): Observable<[GroupAtom[], string]> =>
        this.route.paramMap.pipe(
            switchMap(params => {
                const cid = params.get('cid')
                const lid = params.get('lid')
                const gid = params.get('gid')

                return cid && lid && gid &&
                    zip(
                        this.groupService.getAllWithFilter(cid, lid),
                        of(gid)
                    ) || EMPTY
            })
        )

    private updateUI = (data: [GroupAtom[], string]) => {
        const allGroups = this.setupGroups(data)
        this.setupStudents(allGroups)
        this.updateTitle()
    }

    private updateTitle = () => {
        this.title = `Gruppe ${this.groupLabel} (${this.dataSource.data.length} Mitglieder) bearbeiten`
    }

    private setupGroups = (data: [GroupAtom[], string]) => {
        const allGroups = data[0]
        const selectedGroupId = data[1]

        const [selectedGroup, otherGroups] = partition(allGroups, g => g.id === selectedGroupId)
        this.groupId = selectedGroup[0].id
        this.labworkId = selectedGroup[0].labwork.id
        this.courseId = selectedGroup[0].labwork.course
        this.groupLabel = selectedGroup[0].label
        this.dataSource.data = selectedGroup[0].members
            .sort((a, b) => a.lastname.localeCompare(b.lastname))

        this.otherGroups = otherGroups
            .sort((a, b) => a.label.localeCompare(b.label))
        return allGroups
    }

    private setupStudents = (allGroups: GroupAtom[]) => {
        const setupStudentFormGroup = () => {
            const addStudentFcName = 'member'
            this.studentOption = new FormInputOption<User>(
                addStudentFcName,
                invalidChoiceKey,
                true,
                formatUser,
                this.fellowStudents$
            )
            this.addStudentForm = {
                formControlName: addStudentFcName,
                displayTitle: 'Student hinzufügen',
                isDisabled: false,
                data: this.studentOption
            }
            this.addStudentFormGroup.addControl(
                this.addStudentForm.formControlName,
                new FormControl(this.addStudentForm.data.value, this.addStudentForm.data.validator)
            )

            this.studentOption.onInit(this.addStudentFormGroup)
        }

        const allStudentsInGroup = allGroups.flatMap(g => g.members)
        // TODO remove those who are already applied to related labworks
        this.fellowStudents$ = this.userService.getAllWithFilter({attribute: 'status', value: 'student'}).pipe(
            map(students => students.filter(s => !exists(allStudentsInGroup, x => x.id === s.id)))
        )

        setupStudentFormGroup()
    }

    ngOnDestroy() {
        this.studentOption.onDestroy()
    }

    prepareTableContent = (user: User, index: number, attr: string): string => {
        switch (attr) {
            case 'index':
                return (index + 1).toString()
            case 'name':
                return `${user.lastname}, ${user.firstname}`
            default:
                return user[attr]
        }
    }

    userFormControl = (): AbstractControl =>
        this.addStudentFormGroup.controls[this.addStudentForm.formControlName]

    userFromControl = (): User =>
        this.userFormControl().value as User

    shouldAllowSwapping = (): boolean =>
        this.otherGroups.length > 0

    move = (member: User, dest: GroupAtom) => {
        const movementMsg = (result: GroupMovementResult): string => {
            const cardsUpdated = result.updatedReportCardEntries.length !== 0
            let msg = result.changedMembership ? `moved into group ${result.newMembership.group}` : 'failed to move into dest group'
            if (cardsUpdated) {
                msg += ` and updated ${result.updatedReportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const result$ = this.lwmService.moveStudentToGroup(
            this.courseId,
            {
                labwork: this.labworkId,
                student: member.id,
                srcGroup: this.groupId,
                destGroup: dest.id
            }
        )

        const s = subscribe(result$, result => {
            removeFromDataSource(this.dataSource)(m => m.id === member.id)

            dest.members.push(member)
            this.updateTitle()
            this.alertService.reportSuccess(movementMsg(result))
        })

        this.subs.push(s)
    }

    delete = (member: User) => {
        const deletionMsg = (result: GroupDeletionResult): string => {
            const cardsCreated = result.reportCardEntries.length !== 0
            let msg = result.changedMembership ? 'removed group membership' : 'not removed group membership'
            msg += ` and application: ${JSON.stringify(result.labworkApplication)}`
            if (cardsCreated) {
                msg += ` and ${result.reportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const updateStudentsByAdding = () => {
            this.fellowStudents$ = this.fellowStudents$.pipe(
                tap(xs => xs.push(member))
            )

            if (isOption(this.addStudentForm.data)) {
                this.addStudentForm.data.bindOptions(this.fellowStudents$)
            }
        }

        const delete$ = () => this.lwmService.removeStudentFromGroup(
            this.courseId,
            {
                labwork: this.labworkId,
                group: this.groupId,
                student: member.id
            }
        )

        const result$ = openDialog(
            ConfirmDialogComponent.instance(this.dialog, {title: `${formatUser(member)} aus der Gruppe dauerhaft entfernen?`}),
            res => res === ConfirmationResult.ok ? delete$() : EMPTY
        )

        const s = subscribe(result$, result => {
            removeFromDataSource(this.dataSource)(m => m.id === member.id)

            updateStudentsByAdding()
            this.updateTitle()
            this.alertService.reportSuccess(deletionMsg(result))
        })

        this.subs.push(s)
    }

    add = (member: User) => {
        const creationMsg = (result: GroupInsertionResult): string => {
            const cardsCreated = result.reportCardEntries.length !== 0
            let msg = `created group membership ${JSON.stringify(result.membership)}`
            if (cardsCreated) {
                msg += ` and ${result.reportCardEntries.length} reportcard entries`
            }
            return msg
        }

        const updateStudentsByRemoving = () => {
            this.fellowStudents$ = this.fellowStudents$.pipe(
                map(xs => xs.filter(x => x.id !== member.id))
            )

            if (isOption(this.addStudentForm.data)) {
                this.addStudentForm.data.bindOptions(this.fellowStudents$)
            }
        }

        const result$ = this.lwmService.insertStudentIntoGroup(
            this.courseId,
            {
                labwork: this.labworkId,
                group: this.groupId,
                student: member.id
            }
        )

        const s = subscribe(result$, result => {
            addToDataSource(this.dataSource)(member)
            resetControl(this.userFormControl())

            updateStudentsByRemoving()
            this.updateTitle()
            this.alertService.reportSuccess(creationMsg(result))
        })

        this.subs.push(s)
    }

    fastForward = (member: User) =>
        this.evalExplicit(member, 'fastForward')

    fire = (member: User) =>
        this.evalExplicit(member, 'fire')

    private evalExplicit = (member: User, kind: ExplicitEvaluationKind) => {
        const go = () => this.lwmService.evaluateExplicit(
            this.courseId,
            {
                student: member.id,
                labwork: this.labworkId,
                group: this.groupId,
                kind: kind
            }
        )

        const title = () => {
            switch (kind) {
                case 'fastForward':
                    return `${formatUser(member)} das Praktikum vorzeitig anerkennen?`
                case 'fire':
                    return `${formatUser(member)} endgültig aus dem Praktikum werfen?`
            }
        }

        const successMsg = () => {
            switch (kind) {
                case 'fastForward':
                    return `Praktikum von ${formatUser(member)} vorzeitig anerkannt.`
                case 'fire':
                    return `${formatUser(member)} aus dem Praktikum geworfen`
            }
        }

        const result$ = openDialog(
            ConfirmDialogComponent.instance(this.dialog, {title: title()}),
            res => res === ConfirmationResult.ok ? go() : EMPTY
        )

        const s = subscribe(result$, _ => {
            removeFromDataSource(this.dataSource)(m => m.id === member.id)
            this.updateTitle()
            this.alertService.reportSuccess(successMsg())
        })

        this.subs.push(s)
    }
}
