import {Component, Input, OnInit} from '@angular/core'
import {FormControl} from '@angular/forms'
import {FormInputOption} from '../shared-dialogs/forms/form.input.option'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {User} from '../models/user.model'
import {AuthorityAtom} from '../models/authority.model'

@Component({
    selector: 'lwm-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    @Input() auths: AuthorityAtom[]
    private formInputOption: FormInputOption<User>
    private control: FormControl

    constructor(
        private readonly userService: UserService
    ) {
    }

    ngOnInit() {
        this.formInputOption = new FormInputOption(
            'search',
            '',
            true,
            formatUser,
            this.userService.allStudents(),
            200
        )
        this.control = new FormControl(this.formInputOption.value, this.formInputOption.validator)
        this.formInputOption.bindControl(this.control)
    }

    private userSelected = (student: User) => {
        console.log(student)
        this.control.setValue('')
    }

    private inputClicked = () => this.formInputOption.bindOptionsIfNeeded()
}
