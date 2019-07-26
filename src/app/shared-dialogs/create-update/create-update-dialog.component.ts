import {Component, Inject} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {FormBuilder, FormControl, FormGroup, ValidatorFn} from '@angular/forms'
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
    builder: (formOutputData: FormOutputData[]) => any
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

        this.formGroup.validator = this.dateLessThan('start', 'end')
    }

    private dateLessThan(start: string, end: string) {
        return (group: FormGroup) => {
            const startControl = group.controls[start]
            const endControl = group.controls[end]

            if (startControl.value >= endControl.value) { // TODO message is lost. update UI
                endControl.setErrors({mustMatch: 'Date start should be less than Date end'})
                return {mustMatch: 'Date start should be less than Date end'}
            } else {
                endControl.setErrors(null)
                return {}
            }
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

   /* private formcontrol(name: String): FormControl {
        return this.formGroup.controls[name]
    }*/

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
