import {Observable, Subscription} from 'rxjs'
import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms'
import {debounceTime, map, startWith} from 'rxjs/operators'
import {FormDataStringType, FormInputData} from './form.input'
import {mandatoryOptionsValidator, optionalOptionsValidator} from '../../utils/form.validator'

export class FormInputOption<Option> implements FormInputData<string> {
    readonly type: FormDataStringType
    readonly validator: ValidatorFn | ValidatorFn[]
    readonly value: string

    options: Option[] = []
    filteredOptions: Observable<Option[]>

    private sub: Subscription
    private control: AbstractControl

    constructor(
        private readonly value_: string,
        private readonly controlName: string,
        private readonly errorKey: string,
        private readonly required: boolean,
        private readonly display: (value: Option) => string,
        private readonly getOptions: (options: (value: Option[]) => void) => Subscription
    ) {
        this.type = 'options'
        this.validator = required ? mandatoryOptionsValidator() : optionalOptionsValidator()
        this.value = value_
    }

    onInit(group: FormGroup) {
        this.sub = this.getOptions(os => this.options = os)
        this.control = group.controls[this.controlName]

        this.filteredOptions = this.control.valueChanges
            .pipe(
                debounceTime(200),
                startWith(''),
                map(value => typeof value === 'string' ? value : this.display(value)),
                map(value => value ? this.filter(value) : this.options.slice())
            )
    }

    onDestroy() {
        this.sub.unsubscribe()
    }

    private filter(input: string): Option[] {
        const filterValue = input.toLowerCase()
        return this.options.filter(t => this.display(t).toLowerCase().indexOf(filterValue) >= 0)
    }

    displayFn = (object?: Option): string | undefined => {
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
