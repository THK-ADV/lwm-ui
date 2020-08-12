import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core'
import * as d3 from 'd3'
import {ReportCardEntryService} from '../../services/report-card-entry.service'
import {forkJoin, Subscription} from 'rxjs'
import {first, subscribe} from '../../utils/functions'
import {jsonDrawer} from './d3-drawer'
import {Labwork} from '../../models/labwork.model'
import {map} from 'rxjs/operators'
import {rangeTo} from '../../utils/range'
import {ReportCardEntry} from '../../models/report-card-entry.model'

export type LineColor = string

type Drawer = (data: Readonly<ReportCardEntry[]>, itemColor: string) => void

@Component({
    selector: 'lwm-evaluation-visualisation',
    templateUrl: './evaluation-visualisation.component.html',
    styleUrls: ['./evaluation-visualisation.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EvaluationVisualisationComponent implements OnInit, OnDestroy {

    @Input() labworks: [Labwork, LineColor][] = []
    @Input() courseId = ''
    @Input() width = 0 // TODO width should be determined by the parents width
    @Input() height = 0
    @Input() margin = {top: 20, right: 20, bottom: 50, left: 70}
    @Input() assignmentLabels: string[]

    private sub: Subscription

    constructor(
        private readonly service: ReportCardEntryService
    ) {
    }

    ngOnInit() {
        this.sub = subscribe(forkJoin(this.makeRequest()), this.draw)
    }

    ngOnDestroy() {
        this.sub.unsubscribe()
    }

    private makeRequest = () => {
        const shouldTake = (x: ReportCardEntry): boolean => {
            if (this.assignmentLabels) {
                return this.assignmentLabels.some(_ => _ === x.label)
            } else {
                return x.entryTypes.some(_ => _.entryType === 'Testat')
            }
        }

        return this.labworks.map(([l, _]) => {
            return this.service.getAllWithFilterNonAtomic(this.courseId, {attribute: 'labwork', value: l.id}).pipe(
                map(xs => xs.filter(shouldTake))
            )
        })
    }

    private draw = (xss: ReportCardEntry[][]) => {
        const f = first(xss)

        if (!f) {
            return
        }

        const assignments = new Set<string>(f.map(_ => _.label))
        const drawer = this.setupSvg(assignments.size)

        xss.forEach(xs => {
            // tslint:disable-next-line:no-non-null-assertion
            const [_, color] = this.labworks.find(([l, _]) => l.id === xs[0].labwork)!!
            drawer(xs, color)
        })
    }

    private setupSvg = (numberOfAssignments: number): Drawer => {
        const labelAxis = (xLabel: string, yLabel: string) => {
            svg.append('text')
                .attr('transform',
                    'translate(' + (width / 2) + ' ,' +
                    (height + this.margin.top + 15) + ')')
                .style('text-anchor', 'middle')
                .text(xLabel)

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - this.margin.left)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text(yLabel)
        }

        const addAxis = (): [any, any] => {
            const x = d3.scaleLinear()
                .domain([1, numberOfAssignments])
                .range([0, width])

            svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(x).tickValues(rangeTo(1, numberOfAssignments)))

            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0])

            svg.append('g')
                .call(d3.axisLeft(y))

            return [x, y]
        }

        const width = this.width - this.margin.left - this.margin.right
        const height = this.height - this.margin.top - this.margin.bottom

        const container = d3.select('#svgContainer')
        const svg = container
            .select('svg')
            .attr('width', width + this.margin.left + this.margin.right)
            .attr('height', height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')


        const [scaleX, scaleY] = addAxis()
        labelAxis('Aufgaben', 'Teilnehmer (in %)')

        return jsonDrawer(d3, svg, container, scaleX, scaleY)
    }
}
