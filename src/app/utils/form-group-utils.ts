import {FormGroup} from '@angular/forms'

export const logErrors = (fg: FormGroup) =>
    Object.keys(fg.controls).forEach(k => {
        const control = fg.controls[k]
        const errs = control.errors
        if (errs) {
            console.error(control, errs)
        }
    })
