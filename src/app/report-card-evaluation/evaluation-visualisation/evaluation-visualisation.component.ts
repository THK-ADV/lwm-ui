import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core"
import * as d3 from "d3"
import { ReportCardEntryService } from "../../services/report-card-entry.service"
import { EMPTY, Observable, Subscription, zip } from "rxjs"
import { ReportCardEntry } from "../../services/lwm.service"
import { subscribe } from "../../utils/functions"
import { switchMap } from "rxjs/operators"
import { ActivatedRoute } from "@angular/router"
import { jsonDrawer } from "./d3-drawer"
import { forEachMap, groupBy } from "../../utils/group-by"
import { LabworkService } from "../../services/labwork.service"
import { LabworkAtom } from "../../models/labwork.model"

@Component({
  selector: "lwm-evaluation-visualisation",
  templateUrl: "./evaluation-visualisation.component.html",
  styleUrls: ["./evaluation-visualisation.component.scss"],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class EvaluationVisualisationComponent implements OnInit, OnDestroy {
  // d3 constants
  private readonly width
  private readonly height
  private readonly margin
  private readonly colors = [
    "#A7414A",
    "#00743F",
    "#888C46",
    "#A3586D",
    "#0ABDA0",
  ]

  title: string

  private sub: Subscription

  constructor(
    private readonly reportCardEntryService: ReportCardEntryService,
    private readonly labworkService: LabworkService,
    private readonly route: ActivatedRoute,
  ) {
    this.title = "Statistik"
    this.margin = { top: 30, right: 60, bottom: 60, left: 60 }
    this.width = window.outerWidth - this.margin.left - this.margin.right
    this.height =
      window.outerHeight * 0.6 - this.margin.top - this.margin.bottom
  }

  ngOnInit() {
    this.sub = subscribe(this.fetchData(), ([reportCardEntries, labworks]) => {
      const { semester, course } = labworks[0]
      this.title = `Statistik für ${course.abbreviation} im ${semester.abbreviation}`
      this.renderSvg(reportCardEntries, labworks)
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  private fetchData = (): Observable<[ReportCardEntry[], LabworkAtom[]]> => {
    const reportCards = (
      cid: string,
      sid: string,
    ): Observable<ReportCardEntry[]> =>
      this.reportCardEntryService.getAllWithFilterNonAtomic(cid, {
        attribute: "semester",
        value: sid,
      })

    const labworks = (cid: string, sid: string): Observable<LabworkAtom[]> =>
      this.labworkService.getAll(cid, sid)

    return this.route.paramMap.pipe(
      switchMap((params) => {
        const cid = params.get("cid")
        const sid = params.get("sid")
        return (
          (cid && sid && zip(reportCards(cid, sid), labworks(cid, sid))) ||
          EMPTY
        )
      }),
    )
  }

  private renderSvg = (
    reportCardEntries: ReportCardEntry[],
    labworks: LabworkAtom[],
  ) => {
    const data = groupBy(reportCardEntries, (_) => _.labwork)
    const draw = this.prepareSvg(data.size + 1)

    forEachMap(data, (k, v, i) => {
      const labworkLabel = labworks.find((_) => _.id === k)?.label ?? k
      const color = this.colors[i]

      draw(v, labworkLabel, color)
    })
  }

  private prepareSvg = (numberOfAssignments: number) => {
    const container = d3.select("#svgContainer")
    const svg = this.addSvg(container)
    const [scaleX, scaleY] = this.addAxis(svg, numberOfAssignments)
    this.labelAxis(svg, "Aufgaben", "Teilnehmer in %")

    return jsonDrawer(svg, container, scaleX, scaleY)
  }

  private addSvg = (container) =>
    container
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")",
      )

  private addAxis = (svg, numberOfAssignments: number) => {
    const ticks = [...new Array(numberOfAssignments)].map((_, i) => i + 1)

    const scaleX = d3
      .scaleLinear()
      .domain([1, numberOfAssignments])
      .range([0, this.width])

    svg
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(
        d3
          .axisBottom(scaleX)
          .tickValues(ticks)
          .tickFormat((_) => _.toFixed()),
      )

    const scaleY = d3.scaleLinear().domain([0, 100]).range([this.height, 0])

    svg.append("g").call(d3.axisLeft(scaleY))

    return [scaleX, scaleY]
  }

  private labelAxis = (svg, xLabel: string, yLabel: string) => {
    svg
      .append("text")
      .attr(
        "transform",
        "translate(" +
          this.width / 2 +
          " ," +
          (this.height + this.margin.bottom * 0.75) +
          ")",
      )
      .style("text-anchor", "middle")
      .text(xLabel)

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - this.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yLabel)
  }
}
