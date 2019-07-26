import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {FormControl, FormGroup, ValidatorFn} from '@angular/forms'
import {DIALOG_WIDTH} from '../dialog-constants'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'

type FormDataType = string | number | Date // TODO extend
type FormDataStringType = 'text' | 'number' | 'date'

export interface FormInputData {
    formControlName: string
    placeholder: string
    type: FormDataStringType
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
    builder: (formOutputData: FormOutputData[]) => Object
    composedFromGroupValidator: ValidatorFn | undefined
}

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss'],
    providers: LWMDateAdapter.defaultProviders()
})

export class CreateUpdateDialogComponent {

    private formGroup: FormGroup

    static instance(dialog: MatDialog, payload: FormPayload): MatDialogRef<CreateUpdateDialogComponent> {
        return dialog.open(CreateUpdateDialogComponent, {
            width: DIALOG_WIDTH,
            data: payload
        })
    }

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

        const customValidator = payload.composedFromGroupValidator

        if (customValidator) {
            this.formGroup.setValidators(customValidator)
        }
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const values: FormOutputData[] = this.payload.data.map(d => ({
                formControlName: d.formControlName,
                value: this.convertToType(d.type, this.formGroup.controls[d.formControlName].value)
            }))

            this.closeModal(this.payload.builder(values))
        }
    }

    private hasFormGroupError(name: string): boolean {
        return this.payload.composedFromGroupValidator !== undefined &&
            this.formGroup.hasError(name)
    }

    private formGroupErrorMessage(name: string): string {
        return this.formGroup.getError(name)
    }

    private convertToType(type: FormDataStringType, value: any): FormDataType {
        switch (type) {
            case 'number':
                return +value
            case 'text':
                return '' + value
            case 'date':
                return new Date(this.convertToType('text', value))
        }
    }

    private isStandardInput(data: FormInputData): boolean {
        return data.type === 'number' || data.type === 'text'
    }

    private isDateInput(data: FormInputData): boolean {
        return data.type === 'date'
    }

    private closeModal(result: any | undefined) {
        this.dialogRef.close(result)
    }

}
