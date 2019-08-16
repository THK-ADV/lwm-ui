import {Observable, Subscription} from 'rxjs'
import {AbstractControl, FormGroup} from '@angular/forms'
import {map, startWith} from 'rxjs/operators'

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
