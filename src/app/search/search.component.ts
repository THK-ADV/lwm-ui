import {Component, Input, OnInit} from '@angular/core'
import {FormControl} from '@angular/forms'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {User} from '../models/user.model'
import {AuthorityAtom} from '../models/authority.model'
import {Router} from '@angular/router'

@Component({
    selector: 'lwm-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    @Input() auths: AuthorityAtom[]
    formInputOption: FormInputOption<User>
    control: FormControl

    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {
    }

    ngOnInit() {
        this.formInputOption = new FormInputOption(
            'search',
            '',
            true,
            formatUser,
            this.userService.allStudents()
        )
        this.control = new FormControl(this.formInputOption.value, this.formInputOption.validator)
        this.formInputOption.bindControl(this.control)
    }

    userSelected = (student: User) => {
        this.router.navigate(['e/students', student.id])
        this.control.setValue('')
        this.formInputOption.reset()
    }
    
    inputClicked = () =>
        this.formInputOption.bindOptionsIfNeeded()
}
