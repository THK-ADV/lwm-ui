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
import {Card} from '../card-list/card-list.component'
import {hasCourseManagerPermission} from '../security/user-authority-resolver'

@Component({
    selector: 'lwm-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

    headerTitle: String
    private subs: Subscription[]
    private labwork: Readonly<LabworkAtom>
    private hasPermission: Readonly<boolean>

    groups: Card<GroupAtom, User>[]

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
        this.hasPermission = false
    }

    ngOnInit() {
        const s = subscribe(fetchLabwork$(this.route, this.labworkService), labwork => {
            this.headerTitle += ` für ${labwork.label}`
            this.labwork = labwork

            this.setupPermissionChecks(labwork.course.id)
            this.fetchGroups(labwork)
        })

        this.subs.push(s)
    }

    private setupPermissionChecks = (courseId: string) => {
        this.hasPermission = hasCourseManagerPermission(this.route, courseId)
    }

    private fetchGroups(l: LabworkAtom) {
        const groups$ = this.groupService.getAllWithFilter(l.course.id, l.id).pipe(
            map(gs => gs.sort((lhs, rhs) => lhs.label.localeCompare(rhs.label))),
            map(gs => gs.map(g => {
                g.members = g.members.sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
                return g
            }))
        )

        const s = subscribe(groups$, groups => {
            this.groups = groups.map(g => ({value: g, entries: g.members}))
        })
        this.subs.push(s)
    }

    private fetchApps(l: LabworkAtom): Observable<LabworkApplicationAtom[]> {
        return this.labworkApplicationService.getAllByLabworkAtom(l.id)
    }

    displayUser = (user: User): string => `${user.lastname}, ${user.firstname}`

    displaySystemId = (user: User): string => user.systemId

    onEdit = (group: GroupAtom) => {
        const fellowStudents$ = this.userService.getAllWithFilter(
            {attribute: 'status', value: 'student'},
            {attribute: 'degree', value: group.labwork.degree}
        )

        const dialogRef = GroupEditComponent.instance(this.dialog, group, this.groups.map(g => g.value), fellowStudents$)
        const s = dialogRef.componentInstance.groupChanged.subscribe(_ => {
            this.fetchGroups(this.labwork)
        })
        const s1 = dialogRef.afterClosed().subscribe(a => {
            s.unsubscribe()
        })

        this.subs.push(s1)
    }

    canEdit = (): boolean => {
        return this.hasPermission
    }

    cardTitle = (group: GroupAtom): string => `${group.label} - ${group.members.length} Teilnehmer`
}
