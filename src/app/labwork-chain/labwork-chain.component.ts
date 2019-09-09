import {Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {LabworkAtom} from '../models/labwork.model'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {foldUndefined} from '../utils/functions'
import {TimetableAtom} from '../models/timetable'
import {fetchLabwork, fetchTimetable} from './labwork-chain-view-model'
import {TimetableService} from '../services/timetable.service'

enum Step {
    application,
    timetable,
    blacklists,
    groups,
    schedule,
    reportCards
}

@Component({
    selector: 'lwm-labwork-chain',
    templateUrl: './labwork-chain.component.html',
    styleUrls: ['./labwork-chain.component.scss']
})
export class LabworkChainComponent implements OnInit, OnDestroy {

    private subs: Subscription[]
    private labwork: Readonly<LabworkAtom>
    private timetable: Readonly<TimetableAtom>
    private steps: Step[]

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService,
        private readonly timetableService: TimetableService,
    ) {
        this.subs = []
        this.steps = [
            Step.application,
            Step.timetable,
            Step.blacklists,
            Step.groups,
            Step.schedule,
            Step.reportCards
        ]
    }

    ngOnInit() {
        console.log('chain loaded')

        this.fetchChainData()
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe())
    }

    private updateTimetable = (t: TimetableAtom) => {
        this.timetable = t
    }

    private fetchChainData = () => {
        const s1 = fetchLabwork(this.route, this.labworkService, labwork => {
            this.labwork = labwork

            const s2 = fetchTimetable(this.timetableService, labwork, timetable => { // TODO fetchOrCreate
                this.timetable = timetable
            })

            this.subs.push(s2)
        })

        this.subs.push(s1)
    }

    private label = (step: Step): string => {
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
            case Step.reportCards:
                return 'Notenhefte'
        }
    }

    private next = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() + 1]
    }

    private prev = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() - 1]
    }

    private nextButtonLabel = (step: Step): string => {
        return foldUndefined(this.next(step), this.label, () => '???')
    }

    private prevButtonLabel = (step: Step): string => {
        return foldUndefined(this.prev(step), this.label, () => '???')
    }

    private hasNextButton = (step: Step): boolean => {
        return this.next(step) !== undefined
    }

    private hasPrevButton = (step: Step): boolean => {
        return this.prev(step) !== undefined
    }

    private chainDisabled = (): boolean => false // TODO
}
