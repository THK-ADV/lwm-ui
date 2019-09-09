import {Component, OnInit} from '@angular/core'
import {LabworkService} from '../services/labwork.service'
import {ActivatedRoute} from '@angular/router'
import {fetchLabwork$} from '../utils/component.utils'
import {Observable, Subscription} from 'rxjs'
import {GroupService} from '../services/group.service'
import {map} from 'rxjs/operators'
import {GroupAtom} from '../models/group.model'
import {User} from '../models/user.model'
import {LabworkApplicationAtom} from '../models/labwork.application.model'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {subscribe} from '../utils/functions'
import {LabworkAtom} from '../models/labwork.model'
import {MatDialog} from '@angular/material'
import {UserService} from '../services/user.service'
import {GroupEditComponent} from './edit/group-edit.component'

@Component({
    selector: 'lwm-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

    private headerTitle: String
    private subs: Subscription[]
    private groups: GroupAtom[]
    private labwork: LabworkAtom

    constructor(
        private readonly dialog: MatDialog,
        private readonly groupService: GroupService,
        private readonly labworkService: LabworkService,
        private readonly labworkApplicationService: LabworkApplicationService,
        private readonly userService: UserService,
        private readonly route: ActivatedRoute
    ) {
        this.subs = []
        this.groups = []
        this.headerTitle = 'Gruppen'
    }

    ngOnInit() {
        const s = subscribe(fetchLabwork$(this.route, this.labworkService), labwork => {
            this.headerTitle += ` für ${labwork.label}`
            this.labwork = labwork

            this.fetchGroups(labwork)
        })

        this.subs.push(s)
    }

    private fetchGroups(l: LabworkAtom) {
        const groups$ = this.groupService.getAllWithFilter(l.course.id, l.id).pipe(
            map(gs => gs.sort((lhs, rhs) => lhs.label.localeCompare(rhs.label))),
            map(gs => gs.map(g => {
                g.members = g.members.sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
                return g
            }))
        )

        const s = subscribe(groups$, groups => this.groups = groups)
        this.subs.push(s)
    }

    private fetchApps(l: LabworkAtom): Observable<LabworkApplicationAtom[]> {
        return this.labworkApplicationService.getAllByLabworkAtom(l.id)
    }

    private displayUser(user: User): string {
        return `${user.lastname}, ${user.firstname}`
    }

    private voidF() {
    }

    private onEdit(group: GroupAtom) {
        const fellowStudents$ = this.userService.getAllWithFilter(
            {attribute: 'status', value: 'student'},
            {attribute: 'degree', value: group.labwork.degree}
        )

        const dialogRef = GroupEditComponent.instance(this.dialog, group, this.groups, fellowStudents$)
        const s = dialogRef.componentInstance.groupChanged.subscribe(_ => {
            this.fetchGroups(this.labwork)
        })
        const s1 = dialogRef.afterClosed().subscribe(a => {
            s.unsubscribe()
        })

        this.subs.push(s1)
    }

    private canEdit(): boolean {
        return true // TODO permission
    }

    private cardTitle(group: GroupAtom): string {
        return `${group.label} - ${group.members.length}`
    }
}
