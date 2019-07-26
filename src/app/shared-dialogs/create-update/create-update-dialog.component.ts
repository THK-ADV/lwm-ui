import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {FormControl, FormGroup, ValidatorFn} from '@angular/forms'
import {DIALOG_WIDTH} from '../dialog-constants'

type FormDataType = string | number // TODO extend

export interface FormInputData {
    formControlName: string
    placeholder: string
    type: 'text' | 'number'
    validator: ValidatorFn | ValidatorFn[]
    isDisabled: boolean
    value: FormDataType
}

export interface FormOutputData {
    formControlName: string
    value: FormDataType
}

export interface FormPayload {
    headerTitle: string,
    submitTitle: string,
    data: FormInputData[],
    builder: (formOutputData: FormOutputData[]) => any
}

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss']
})
export class CreateUpdateDialogComponent {

    private formGroup: FormGroup

    constructor(
        private dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private payload: FormPayload
    ) {
        this.formGroup = new FormGroup({})

        payload.data.forEach(d => {
            const fc = new FormControl(d.value, d.validator)

            if (d.isDisabled) {
                fc.disable()
            }

            this.formGroup.addControl(d.formControlName, fc)
        })
    }

    static instance(dialog: MatDialog, payload: FormPayload): MatDialogRef<CreateUpdateDialogComponent> {
        return dialog.open(CreateUpdateDialogComponent, {
            width: DIALOG_WIDTH,
            data: payload,
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const values: FormOutputData[] = this.payload.data.map(d => {
                const value = this.formGroup.controls[d.formControlName].value

                switch (d.type) {
                    case 'number':
                        return {formControlName: d.formControlName, value: +value}
                    case 'text':
                        return {formControlName: d.formControlName, value: '' + value}
                }
            })

            this.closeModal(this.payload.builder(values))
        }
    }

    private closeModal(result: any | undefined) {
        this.dialogRef.close(result)
    }

}
