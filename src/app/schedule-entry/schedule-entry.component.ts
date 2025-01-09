import { Component, OnDestroy, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { EMPTY, Subscription, zip } from "rxjs"
import { ReportCardEntryService } from "../services/report-card-entry.service"
import { switchMap } from "rxjs/operators"
import { ScheduleEntryService } from "../services/schedule-entry.service"
import { ScheduleEntryAtom } from "../models/schedule-entry.model"
import { ReportCardEntryAtom } from "../models/report-card-entry.model"
import { subscribe } from "../utils/functions"
import { ReportCardRescheduledAtom } from "../models/report-card-rescheduled.model"

export const isRescheduledInto = (
  s: ScheduleEntryAtom,
  rescheduled?: ReportCardRescheduledAtom,
): boolean =>
  rescheduled !== undefined &&
  rescheduled.date.getTime() === s.date.getTime() &&
  rescheduled.start.equals(s.start) &&
  rescheduled.end.equals(s.end) &&
  rescheduled.room.id === s.room.id

@Component({
  selector: "lwm-schedule-entry",
  templateUrl: "./schedule-entry.component.html",
  styleUrls: ["./schedule-entry.component.scss"],
  standalone: false,
})
export class ScheduleEntryComponent implements OnInit, OnDestroy {
  reportCardEntries: Readonly<
    [ReportCardEntryAtom, number, ReportCardRescheduledAtom[]][]
  >
  scheduleEntry: Readonly<ScheduleEntryAtom>

  subs: Subscription[] = []

  constructor(
    private readonly route: ActivatedRoute,
    private readonly scheduleEntryService: ScheduleEntryService,
    private readonly reportCardService: ReportCardEntryService,
  ) {}

  ngOnInit(): void {
    this.subs.push(
      subscribe(
        this.route.paramMap.pipe(
          switchMap((map) => {
            const cid = map.get("cid")
            const sid = map.get("sid")
            return cid && sid
              ? zip(
                  this.reportCardService.fromScheduleEntry(cid, sid),
                  this.scheduleEntryService.get(cid, sid),
                )
              : EMPTY
          }),
        ),
        (data) => this.updateUI(data[0], data[1]),
      ),
    )
  }

  ngOnDestroy() {
    this.subs.forEach((_) => _.unsubscribe())
  }

  private updateUI = (
    reportCardEntries: Readonly<
      [ReportCardEntryAtom, number, ReportCardRescheduledAtom[]][]
    >,
    scheduleEntry: Readonly<ScheduleEntryAtom>,
  ) => {
    this.reportCardEntries = reportCardEntries
    this.scheduleEntry = scheduleEntry
  }
}
