import {Observable, Subscription} from 'rxjs'
import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms'
import {debounceTime, map, startWith} from 'rxjs/operators'
import {FormDataStringType, FormInputData} from './form.input'
import {mandatoryOptionsValidator, optionalOptionsValidator} from '../../utils/form.validator'
import {foldUndefined, subscribe, voidF} from '../../utils/functions'

export class FormInputOption<Option> implements FormInputData<string> {
    readonly type: FormDataStringType
    readonly validator: ValidatorFn | ValidatorFn[]
    readonly value: string

    private readonly subs: Subscription[]
    private options: Option[] = []
    private filteredOptions: Observable<Option[]>

    control: Readonly<AbstractControl>

    constructor(
        readonly controlName: string,
        private readonly errorKey: string,
        private readonly required: boolean,
        private readonly display: (value: Option) => string,
        private readonly options$: Observable<Option[]>,
        private readonly selected?: (options: Option[]) => Option | undefined
    ) {
        this.value = ''
        this.type = 'options'
        this.validator = required ? mandatoryOptionsValidator() : optionalOptionsValidator()
        this.subs = []
    }

    onInit = (group: FormGroup) => {
        this.control = group.controls[this.controlName]
        this.bindOptions0(this.options$, os => {
            foldUndefined(this.selected, f => foldUndefined(f(os), v => this.control.setValue(v), voidF), voidF)
        })
    }

    bindOptions = (options$: Observable<Option[]>) => {
        this.bindOptions0(options$, voidF)
    }

    private bindOptions0 = (options$: Observable<Option[]>, completion: (os: Option[]) => void) => {
        this.subs.push(subscribe(options$, os => {
            this.options = os
            completion(os)
        }))

        this.filteredOptions = this.control.valueChanges
            .pipe(
                debounceTime(200),
                startWith(''),
                map(value => typeof value === 'string' ? value : this.display(value)),
                map(value => value ? this.filter(value) : this.options.slice())
            )
    }

    onDestroy = () => {
        this.subs.forEach(s => s.unsubscribe())
    }

    private filter = (input: string): Option[] => {
        const filterValue = input.toLowerCase()
        return this.options.filter(t => this.display(t).toLowerCase().indexOf(filterValue) >= 0)
    }

    displayFn = (object?: Option): string | undefined => {
        if (!object) {
            return undefined
        }

        return this.display(object)
    }

    hasError = (): boolean => {
        return !this.control.untouched && this.control.hasError(this.errorKey)
    }

    getErrorMessage = (): string => {
        return this.control.getError(this.errorKey)
    }
}
