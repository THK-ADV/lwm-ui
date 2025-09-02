import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {LabworkAtom} from '../models/labwork.model'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {foldUndefined, NotImplementedError, subscribe} from '../utils/functions'
import {TimetableAtom} from '../models/timetable'
import {
    fetchApplicationCount,
    fetchAssignmentEntries,
    fetchLabwork,
    fetchOrCreateTimetable,
    fetchReportCardEntryCount,
    fetchScheduleEntries
} from './labwork-chain-view-model'
import {TimetableService} from '../services/timetable.service'
import {ScheduleEntryService, SchedulePreview} from '../services/schedule-entry.service'
import {ScheduleEntryAtom} from '../models/schedule-entry.model'
import {MatHorizontalStepper} from '@angular/material/stepper'
import {AssignmentEntriesService} from '../services/assignment-entries.service'
import {BlacklistService} from '../services/blacklist.service'
import {LabworkApplicationService} from '../services/labwork-application.service'
import {ReportCardEntryService} from '../services/report-card-entry.service'
import {hasCourseManagerPermission} from '../security/user-authority-resolver'
import {AssignmentEntry} from '../models/assignment-plan.model'

enum Step {
    application,
    timetable,
    blacklists,
    groups,
    schedule,
    closing
}

type GroupViewMode = 'waitingForApplications' | 'waitingForPreview' | 'groupsPresent'

@Component({
    selector: 'lwm-labwork-chain',
    templateUrl: './labwork-chain.component.html',
    styleUrls: ['./labwork-chain.component.scss']
})
export class LabworkChainComponent implements OnInit, OnDestroy {

    private subs: Subscription[]

    labwork: Readonly<LabworkAtom>
    timetable: Readonly<TimetableAtom>
    assignmentEntries: Readonly<AssignmentEntry[]>
    schedulePreview: Readonly<SchedulePreview> | undefined
    scheduleEntries: Readonly<ScheduleEntryAtom[]>
    applications: Readonly<number>
    reportCards: Readonly<number>

    steps: Step[]

    @ViewChild('stepper') stepper: MatHorizontalStepper

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService,
        private readonly timetableService: TimetableService,
        private readonly blacklistService: BlacklistService,
        private readonly scheduleEntryService: ScheduleEntryService,
        private readonly assignmentPlanService: AssignmentEntriesService,
        private readonly labworkApplicationService: LabworkApplicationService,
        private readonly reportCardService: ReportCardEntryService,
    ) {
        this.subs = []
        this.steps = [
            Step.application,
            Step.timetable,
            Step.blacklists,
            Step.groups,
            Step.schedule,
            Step.closing
        ]
    }

    ngOnInit() {
        console.log('chain loaded')

        this.fetchChainData()
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    updateLabwork = (l: LabworkAtom) => {
        this.labwork = l
    }

    updateTimetable = (t: TimetableAtom) => {
        this.timetable = t
    }

    updateAssignmentEntries = (xs: AssignmentEntry[]) => {
        this.assignmentEntries = xs
    }

    updateSchedulePreview = (p: SchedulePreview) => {
        this.schedulePreview = p
    }

    deleteScheduleEntries = () => {
        this.scheduleEntries = []
        this.jumpToGroups()
    }

    deleteReportCards = () => {
        this.reportCards = 0
    }

    createScheduleEntries = (es: ScheduleEntryAtom[]) => {
        this.scheduleEntries = es
        this.schedulePreview = undefined
    }

    createReportCards = (n: number) => {
        this.reportCards = n
    }

    deleteSchedulePreview = () => {
        this.schedulePreview = undefined
        this.jumpToGroups()
    }

    private jumpToGroups = () => this.stepper.selectedIndex = Step.groups.valueOf()

    private fetchChainData = () => {
        const s1 = fetchLabwork(this.route, this.labworkService, labwork => {
            this.labwork = labwork

            this.subscribeAndPush(fetchAssignmentEntries(this.assignmentPlanService, labwork), xs => this.assignmentEntries = xs)
            this.subscribeAndPush(fetchOrCreateTimetable(this.timetableService, this.blacklistService, labwork), tt => this.timetable = tt)
            this.subscribeAndPush(fetchApplicationCount(this.labworkApplicationService, labwork), a => this.applications = a)
            this.subscribeAndPush(fetchScheduleEntries(this.scheduleEntryService, labwork), s => this.scheduleEntries = s)
            this.subscribeAndPush(fetchReportCardEntryCount(this.reportCardService, labwork), n => this.reportCards = n)
        })

        this.subs.push(s1)
    }

    private subscribeAndPush = <T>(o: Observable<T>, f: (t: T) => void) => {
        this.subs.push(subscribe(o, f))
    }

    label = (step: Step): string => {
        switch (step) {
            case Step.application:
                return 'Ablaufplan'
            case Step.timetable:
                return 'Rahmenplan'
            case Step.blacklists:
                return 'Geblockte Tage'
            case Step.groups:
                return 'Gruppen'
            case Step.schedule:
                return 'Staffelplan'
            case Step.closing:
                return 'Abschluss'
        }
    }

    private next = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() + 1]
    }

    private prev = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() - 1]
    }

    hasNextButton = (step: Step): boolean => {
        return this.next(step) !== undefined
    }

    hasPrevButton = (step: Step): boolean => {
        return this.prev(step) !== undefined
    }

    isStepCompleted = (step: Step): boolean => {
        switch (step) {
            case Step.application:
            case Step.timetable:
            case Step.blacklists:
                return true
            case Step.groups:
                return this.hasSchedulePreview() || this.hasScheduleEntries()
            case Step.schedule:
                return this.hasScheduleEntries()
            case Step.closing:
                return this.isStepCompleted(Step.schedule) && this.hasReportCardEntries()
        }
    }

    hasPermission = (): boolean => hasCourseManagerPermission(this.route, this.labwork.course.id)

    isStepLocked = (step: Step): boolean => {
        if (!this.hasPermission()) {
            return true
        }

        switch (step) {
            case Step.application:
            case Step.timetable:
            case Step.blacklists:
                return this.hasSchedulePreview() || this.hasScheduleEntries() || this.hasReportCardEntries()
            case Step.groups:
                return NotImplementedError('use groupViewMode() instead')
            case Step.schedule:
                return !this.hasSchedulePreview() && this.hasScheduleEntries()
            case Step.closing:
                return this.isStepLocked(Step.schedule) && this.hasReportCardEntries()
        }
    }

    hasReportCardEntries = () => this.reportCards > 0

    private hasScheduleEntries = () => foldUndefined(this.scheduleEntries, xs => xs.length > 0, () => false)

    private hasSchedulePreview = () => foldUndefined(this.schedulePreview, () => true, () => false)

    groupViewMode = (): GroupViewMode => {
        if (this.applications > 0) {
            if (this.hasScheduleEntries()) {
                return this.groupsPresent()
            } else {
                return this.waitingForPreview()
            }
        } else {
            return this.waitingForApplications()
        }
    }

    waitingForApplications = (): GroupViewMode => 'waitingForApplications'

    waitingForPreview = (): GroupViewMode => 'waitingForPreview'

    groupsPresent = (): GroupViewMode => 'groupsPresent'
}
