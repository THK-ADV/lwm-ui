import {Component, Inject, OnDestroy, OnInit} from '@angular/core'
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material'
import {AbstractControl, FormControl, FormGroup, ValidatorFn} from '@angular/forms'
import {DIALOG_WIDTH} from '../dialog-constants'
import {LWMDateAdapter} from '../../utils/lwmdate-adapter'
import {Observable, Subscription} from 'rxjs'
import {map, startWith} from 'rxjs/operators'
import {Time} from '../../models/time.model'
import {invalidLocalTimeKey} from '../../utils/form.validator'

type FormDataType = string | number | Date | Time | boolean
type FormDataStringType = 'text' | 'number' | 'date' | 'time' | 'options' | 'textArea' | 'boolean'

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

export interface FormPayload<Protocol> {
    headerTitle: string,
    submitTitle: string,
    data: FormInputData[],
    makeProtocol: (formOutputData: FormOutputData[]) => Protocol
    composedFromGroupValidator?: ValidatorFn,
    formInputOption?: FormInputOption<Object>
}

export class FormInputOption<T> {
    options: T[] = []
    filteredOptions: Observable<T[]>

    private sub: Subscription
    private control: AbstractControl

    constructor(
        private readonly controlName: string,
        private readonly errorKey: string,
        private readonly display: (value: T) => string,
        private readonly getOptions: (options: (value: T[]) => void) => Subscription
    ) {
    }

    onInit(group: FormGroup) {
        this.sub = this.getOptions(os => this.options = os)
        this.control = group.controls[this.controlName]

        this.filteredOptions = this.control.valueChanges
            .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : this.display(value)),
                map(value => value ? this.filter(value) : this.options.slice())
            )
    }

    onDestroy() {
        this.sub.unsubscribe()
    }

    private filter(input: string): T[] {
        const filterValue = input.toLowerCase()
        return this.options.filter(t => this.display(t).toLowerCase().indexOf(filterValue) >= 0)
    }

    displayFn = (object?: T): string | undefined => {
        if (!object) {
            return undefined
        }

        return this.display(object)
    }

    hasError(): boolean {
        return !this.control.untouched && this.control.hasError(this.errorKey)
    }

    getErrorMessage(): string {
        return this.control.getError(this.errorKey)
    }
}

@Component({
    selector: 'app-create-update-dialog',
    templateUrl: './create-update-dialog.component.html',
    styleUrls: ['./create-update-dialog.component.scss'],
    providers: LWMDateAdapter.defaultProviders()
})
export class CreateUpdateDialogComponent<Protocol, Model> implements OnInit, OnDestroy {

    private formGroup: FormGroup

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
        @Inject(MAT_DIALOG_DATA) private payload: FormPayload<Protocol>
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

    ngOnInit(): void {
        const option = this.payload.formInputOption

        if (option) {
            option.onInit(this.formGroup)
        }
    }

    ngOnDestroy(): void {
        const option = this.payload.formInputOption

        if (option) {
            option.onDestroy()
        }
    }

    onCancel(): void {
        this.closeModal(undefined)
    }

    onSubmit() {
        if (this.formGroup.valid) {
            const updatedValues: FormOutputData[] = this.payload.data
                .filter(d => !d.isDisabled)
                .map(d => ({
                    formControlName: d.formControlName,
                    value: this.convertToType(d.type, this.formGroup.controls[d.formControlName].value)
                }))

            this.closeModal(this.payload.makeProtocol(updatedValues))
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

    private convertToType(type: FormDataStringType, value: any): FormDataType {
        switch (type) {
            case 'number':
                return +value
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
                const timeString = string.split(':').map(s => s.length === 1 ? s.padStart(2, '0') : s).join(':')
                return Time.fromTimeString(timeString)
            case 'boolean':
                return !!value
        }
    }

    private closeModal(result?: Protocol) {
        this.dialogRef.close(result)
    }
}
