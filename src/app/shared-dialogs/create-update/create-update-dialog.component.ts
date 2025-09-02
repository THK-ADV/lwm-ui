import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog'
import {FormControl, FormGroup, ValidatorFn} from '@angular/forms'
import {DIALOG_WIDTH} from '../dialog-constants'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'
import {invalidLocalTimeKey} from '../../utils/form.validator'
import {FormDataStringType, FormDataType, FormInput, FormInputData} from '../forms/form.input'
import {foreachOption, getOptionErrorMessage, hasOptionError} from '../../utils/form-control-utils'
import {mapUndefined, parseUnsafeBoolean, parseUnsafeNumber} from '../../utils/functions'

export interface FormOutputData {
    attr: string
    value: FormDataType
}

export interface FormPayload<Protocol> {
    headerTitle: string,
    submitTitle: string,
    data: FormInput[],
    makeProtocol: (formOutputData: FormOutputData[]) => Protocol
    composedFromGroupValidator?: ValidatorFn
}

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss'],
    providers: LWMDateAdapter.defaultProviders()
})
export class CreateUpdateDialogComponent<Protocol, Model> implements OnInit, OnDestroy {

    formGroup: FormGroup

    static instance<Protocol, Model>(
        dialog: MatDialog,
        payload: FormPayload<Protocol>
    ): MatDialogRef<CreateUpdateDialogComponent<Protocol, Model>, Protocol> {
        return dialog.open<CreateUpdateDialogComponent<Protocol, Model>, any, Protocol>(CreateUpdateDialogComponent, {
            width: DIALOG_WIDTH,
            data: payload,
            panelClass: 'lwmCreateUpdateDialog'
        })
    }

    constructor(
        private dialogRef: MatDialogRef<CreateUpdateDialogComponent<Protocol, Model>, Protocol>,
        @Inject(MAT_DIALOG_DATA) public payload: FormPayload<Protocol>
    ) {
        this.formGroup = new FormGroup({})

        payload.data.forEach(d => {
            const fc = new FormControl(d.data.value, d.data.validator)

            if (d.isDisabled) {
                fc.disable()
            }

            this.formGroup.addControl(d.formControlName, fc)
        })

        mapUndefined(payload.composedFromGroupValidator, v => this.formGroup.setValidators(v))
    }

    ngOnInit(): void {
        foreachOption(this.payload.data, o => o.onInit(this.formGroup))
    }

    ngOnDestroy(): void {
        foreachOption(this.payload.data, o => o.onDestroy())
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const updatedValues: FormOutputData[] = this.payload.data
                .filter(d => !d.isDisabled) // TODO why do we filter them out? as a consequence, one have to manually set all disabled properties, which is a huge source of error
                .map(d => ({
                    attr: d.formControlName,
                    value: this.convertToType(d.data.type, this.formGroup.controls[d.formControlName].value)
                }))

            this.closeModal(this.payload.makeProtocol(updatedValues))
        } else {
            // Object.keys(this.formGroup.controls).forEach(k => console.error(this.formGroup.controls[k].errors))
        }
    }

    private hasFormGroupError(name: string): boolean {
        return this.payload.composedFromGroupValidator !== undefined &&
            this.formGroup.hasError(name)
    }

    private formGroupErrorMessage(name: string): string {
        return this.formGroup.getError(name)
    }

    hasLocalTimeError(controlName: string): boolean {
        const control = this.formGroup.controls[controlName]
        return !control.untouched && control.hasError(invalidLocalTimeKey)
    }

    getLocalTimeErrorMessage(controlName: string): string {
        return this.formGroup.controls[controlName].getError(invalidLocalTimeKey)
    }

    hasOptionError_(formInputData: FormInputData<any>): boolean {
        return hasOptionError(formInputData)
    }

    getOptionErrorMessage_(formInputData: FormInputData<any>): string {
        return getOptionErrorMessage(formInputData)
    }

    private convertToType(type: FormDataStringType, value: any): FormDataType {
        switch (type) {
            case 'number':
                return parseUnsafeNumber(value)
            case 'options':
                return this.convertToType('text', value.id)
            case 'textArea':
                return this.convertToType('text', value)
            case 'text':
                return '' + value
            case 'date':
                return new Date(this.convertToType('text', value) as string)
            case 'time':
                const string = this.convertToType('text', value) as string
                return string.split(':').map(s => s.length === 1 ? s.padStart(2, '0') : s).join(':')
            case 'boolean':
                return parseUnsafeBoolean(value)
            case 'select':
                return this.convertToType('text', value)
        }
    }

    private closeModal(result?: Protocol) {
        this.dialogRef.close(result)
    }
}
