import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatOptionSelectionChange} from '@angular/material'
import {LabworkAtom} from '../../models/labwork.model'
import {FormControl, FormGroup} from '@angular/forms'
import {FormInput} from '../../shared-dialogs/forms/form.input'
import {FormInputOption} from '../../shared-dialogs/forms/form.input.option'
import {User} from '../../models/user.model'
import {invalidChoiceKey} from '../../utils/form.validator'
import {formatUser} from '../../utils/component.utils'
import {BuddyResult, UserService} from '../../services/user.service'
import {LabworkApplicationAtom, LabworkApplicationProtocol} from '../../models/labwork.application.model'
import {isOption} from '../../utils/form-control-utils'
import {isUser} from '../../utils/type.check.utils'
import {Subscription} from 'rxjs'
import {subscribe} from '../../utils/functions'

@Component({
    selector: 'lwm-student-create-application',
    templateUrl: './student-create-application.component.html',
    styleUrls: ['./student-create-application.component.scss']
})
export class StudentCreateApplicationComponent implements OnInit, OnDestroy {

    formGroup: FormGroup
    optionControls: { input: FormInput, hint: string | undefined }[]

    private subs: Subscription[] = []

    static instance(
        dialog: MatDialog,
        labwork: LabworkAtom,
        applicantId: string,
        app: LabworkApplicationAtom | undefined
    ): MatDialogRef<StudentCreateApplicationComponent, LabworkApplicationProtocol> {
        return dialog.open<StudentCreateApplicationComponent, any, LabworkApplicationProtocol>(StudentCreateApplicationComponent, {
            minWidth: '600px',
            data: [labwork, app, applicantId],
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<StudentCreateApplicationComponent, LabworkApplicationProtocol>,
        private readonly userService: UserService,
        @Inject(MAT_DIALOG_DATA) public payload: [LabworkAtom, LabworkApplicationAtom, string]
    ) {
        this.formGroup = new FormGroup({})
        this.optionControls = []
    }

    ngOnInit(): void {
        this.optionControls = this.inputData().map(i => ({input: i, hint: undefined}))
        this.optionControls.forEach(d => {
            const fc = new FormControl(d.input.data.value, d.input.data.validator)
            this.formGroup.addControl(d.input.formControlName, fc)

            if (isOption(d.input.data)) {
                d.input.data.onInit(this.formGroup)
            }
        })

    }

    ngOnDestroy(): void {
        this.subs.forEach(_ => _.unsubscribe())
    }

    optionControl = (input: FormInput): FormInputOption<User> | undefined =>
        isOption(input.data) ? input.data : undefined

    headerTitle = () => {
        const labworkLabel = this.labwork().label
        return this.isEditDialog() ?
            `Bearbeitung der Anmeldung für ${labworkLabel}` :
            `Anmeldung für ${labworkLabel}`
    }

    buttonTitle = () =>
        this.isEditDialog() ? 'Aktualisieren' : 'Anmelden'

    isEditDialog = () =>
        this.existingApplication() !== undefined

    onSubmit = () => {
        if (!this.formGroup.valid) {
            return
        }

        const extractFriends = () => {
            const users: string[] = []

            this.optionControls.forEach(c => {
                const user = this.formGroup.controls[c.input.formControlName].value
                if (isUser(user)) {
                    users.push(user.id)
                }
            })

            return users
        }

        const p: LabworkApplicationProtocol = {
            applicant: this.applicantId(),
            labwork: this.labwork().id,
            friends: extractFriends()
        }

        this.dialogRef.close(p)
    }

    onCancel = () =>
        this.dialogRef.close()

    private labwork = (): LabworkAtom =>
        this.payload[0]

    private existingApplication = (): LabworkApplicationAtom | undefined =>
        this.payload[1]

    private applicantId = (): string =>
        this.payload[2]

    // TODO reuse instead of copy
    inputData = (): FormInput[] => {
        const fellowStudents$ = this.userService.getAllWithFilter(
            {attribute: 'status', value: 'student'},
            {attribute: 'degree', value: this.labwork().degree.id}
        )

        const friendFormInputAt = (i: 0 | 1) => {
            const controlName = i === 0 ? 'friends1' : 'friends2'
            const app = this.existingApplication()
            const displayUser = (u: User) => u.systemId

            if (app && app.friends.length >= i + 1) {
                return new FormInputOption<User>(
                    controlName,
                    invalidChoiceKey,
                    false,
                    displayUser,
                    fellowStudents$,
                    0,
                    opts => opts.find(_ => _.id === app.friends[i].id)
                )
            } else {
                return new FormInputOption<User>(
                    controlName,
                    invalidChoiceKey,
                    false,
                    displayUser,
                    fellowStudents$,
                    0
                )
            }
        }

        return [
            {
                formControlName: 'friends1',
                displayTitle: 'Partnerwunsch 1 (Optional)',
                isDisabled: false,
                data: friendFormInputAt(0)
            },
            {
                formControlName: 'friends2',
                displayTitle: 'Partnerwunsch 2 (Optional)',
                isDisabled: false,
                data: friendFormInputAt(1)
            }
        ]
    }

    onSelectionChange = (c: MatOptionSelectionChange, input: { input: FormInput, hint: string | undefined }) => {
        const user = c.source.value
        if (!(c.isUserInput && isUser(user))) {
            return
        }

        const updateHint = (res: BuddyResult) => {
            input.hint = res.message
        }

        this.subs.push(subscribe(
            this.userService.buddy(this.labwork().id, this.applicantId(), user.systemId),
            updateHint
        ))
    }
}
