import {Component, OnDestroy, OnInit} from '@angular/core'
import {Subscription} from 'rxjs'
import {LabworkAtom} from '../models/labwork.model'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {foldUndefined, subscribe} from '../utils/functions'
import {fetchLabwork} from '../utils/component.utils'

enum Step {
    application,
    timetable,
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

    private sub: Subscription
    private labwork: LabworkAtom
    private steps: Step[]

    constructor(
        private readonly route: ActivatedRoute,
        private readonly labworkService: LabworkService,
    ) {
        this.steps = [
            Step.application,
            Step.timetable,
            Step.groups,
            Step.schedule,
            Step.reportCards
        ]
    }

    ngOnInit() {
        console.log('chain loaded')

        this.sub = subscribe(fetchLabwork(this.route, this.labworkService), labwork => {
            this.labwork = labwork
        })
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe()
    }

    label = (step: Step): string => {
        switch (step) {
            case Step.application:
                return 'Ablaufplan'
            case Step.timetable:
                return 'Rahmenplan'
            case Step.groups:
                return 'Gruppen'
            case Step.schedule:
                return 'Staffelplan'
            case Step.reportCards:
                return 'Notenhefte'
        }
    }

    next = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() + 1]
    }

    prev = (step: Step): Step | undefined => {
        return this.steps[step.valueOf() - 1]
    }

    nextButtonLabel = (step: Step): string => {
        return foldUndefined(this.next(step), this.label, () => '???')
    }

    prevButtonLabel = (step: Step): string => {
        return foldUndefined(this.prev(step), this.label, () => '???')
    }

    hasNextButton = (step: Step): boolean => {
        return this.next(step) !== undefined
    }

    hasPrevButton = (step: Step): boolean => {
        return this.prev(step) !== undefined
    }

    chainDisabled = (): boolean => false
}
