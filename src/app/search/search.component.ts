import {Component, Input, OnDestroy, OnInit} from '@angular/core'
import {FormControl} from '@angular/forms'
import {UserService} from '../services/user.service'
import {formatUser} from '../utils/component.utils'
import {User} from '../models/user.model'
import {AuthorityAtom} from '../models/authority.model'
import {Router} from '@angular/router'
import {Observable, Subscription} from 'rxjs'
import {debounceTime, map, startWith} from 'rxjs/operators'
import {subscribe} from '../utils/functions'
import {resetControl} from '../utils/form-control-utils'

@Component({
    selector: 'lwm-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

    @Input() auths: AuthorityAtom[]

    users: User[] = []
    userControl = new FormControl()
    filteredUser: Observable<User[]>
    sub: Subscription
    toHighlight = ''

    constructor(
        private readonly userService: UserService,
        private readonly router: Router
    ) {
    }

    ngOnDestroy() {
        this.sub.unsubscribe()
    }

    ngOnInit() {
        this.sub = subscribe(this.userService.allStudents(), users => {
            users = users.sort((a, b) => a.lastname.localeCompare(b.lastname) || a.firstname.localeCompare(b.firstname))

            this.users = users

            this.filteredUser = this.userControl.valueChanges.pipe(
                debounceTime(300),
                startWith(''),
                map(value => typeof value === 'string' ? value : this.display(value)),
                map(value => value ? this.filter(value) : this.users.slice())
            )
        })
    }

    userSelected = (student: User) => {
        this.router.navigate(['students', student.id])
            .then(a => a && resetControl(this.userControl))
            .catch(error => console.log(error))
    }

    displayFn = (user?: User): string | undefined =>
        user && this.display(user)

    private display = (user: User) =>
        formatUser(user)

    private filter = (input: string): User[] => {
        input = input.toLowerCase()
        this.toHighlight = input
        return this.users.filter(t => this.display(t).toLowerCase().indexOf(input) >= 0)
    }
}
