import { Component, Input, OnInit } from "@angular/core"
import { ScheduleEntryAtom } from "../../models/schedule-entry.model"
import { ReportCardEntryAtom } from "../../models/report-card-entry.model"
import { shortUserName } from "../../labwork-chain/timetable/timetable-view-model"
import { first, foldUndefined } from "../../utils/functions"
import { format, formatTime } from "../../utils/lwmdate-adapter"
import { isRescheduledInto } from "../schedule-entry.component"
import { latestReportCardReschedule } from "../../models/report-card-entry-reschedules.model"
import { ReportCardRescheduledAtom } from "../../models/report-card-rescheduled.model"

interface HeaderView {
  title: string
  assignment: string
  room: string
  date: string
  timePeriod: string
  supervisors: string
  participants: string
}

@Component({
  selector: "lwm-schedule-entry-header",
  templateUrl: "./schedule-entry-header.component.html",
  styleUrls: ["./schedule-entry-header.component.scss"],
  standalone: false,
})
export class ScheduleEntryHeaderComponent implements OnInit {
  constructor() {}

  @Input() reportCardEntries: Readonly<
    [ReportCardEntryAtom, number, ReportCardRescheduledAtom[]][]
  >
  @Input() scheduleEntry: Readonly<ScheduleEntryAtom>
  headerView: HeaderView

  ngOnInit(): void {
    this.headerView = this.makeHeaderView(
      this.scheduleEntry,
      this.reportCardEntries.map((a) => [a[0], a[2]]),
    )
  }

  private makeHeaderView = (
    s: Readonly<ScheduleEntryAtom>,
    es: Readonly<[ReportCardEntryAtom, ReportCardRescheduledAtom[]][]>,
  ): HeaderView => ({
    title: this.headerTitle(s),
    assignment: this.assignmentLabel(es),
    date: this.dateLabel(s),
    participants: this.participantsLabel(es, s),
    room: this.roomLabel(s),
    supervisors: this.supervisorLabel(s),
    timePeriod: this.timePeriodLabel(s),
  })

  private supervisorLabel = (x: Readonly<ScheduleEntryAtom>) =>
    x.supervisor.map(shortUserName).join(", ")

  private participantsLabel = (
    xs: Readonly<[ReportCardEntryAtom, ReportCardRescheduledAtom[]][]>,
    se: Readonly<ScheduleEntryAtom>,
  ) => {
    let honest = 0
    let rescheduledOut = 0
    let rescheduledIn = 0

    xs.forEach(([_, reschedules]) => {
      const rescheduled = latestReportCardReschedule(reschedules)

      if (rescheduled !== undefined) {
        // TODO add support for retries
        if (isRescheduledInto(se, rescheduled)) {
          rescheduledIn += 1
        } else {
          rescheduledOut += 1
        }
      } else {
        honest += 1
      }
    })

    honest += rescheduledIn
    let base = `${honest} Teilnehmer`

    if (rescheduledIn !== 0 && rescheduledOut !== 0) {
      base += ` (${rescheduledIn} hinzugefügt und ${rescheduledOut} entfernt)`
    } else if (rescheduledIn !== 0) {
      base += ` (${rescheduledIn} hinzugefügt)`
    } else if (rescheduledOut !== 0) {
      base += ` (${rescheduledOut} entfernt)`
    }

    return base
  }

  private assignmentLabel = (
    xs: Readonly<[ReportCardEntryAtom, ReportCardRescheduledAtom[]][]>,
  ) => {
    return foldUndefined(
      first(xs),
      ([entry]) => {
        const index = entry.assignmentIndex + 1
        return `${index} - ${entry.label}`
      },
      () => ``,
    )
  }

  private roomLabel = (x: Readonly<ScheduleEntryAtom>) => {
    return x.room.label
  }

  private dateLabel = (x: Readonly<ScheduleEntryAtom>) =>
    format(x.date, "dd.MM.yyyy")

  private timePeriodLabel = (x: Readonly<ScheduleEntryAtom>) => {
    const start = formatTime(x.start, "HH:mm")
    const end = formatTime(x.end, "HH:mm")
    return `${start} Uhr - ${end} Uhr`
  }

  private headerTitle = (x: Readonly<ScheduleEntryAtom>) => {
    const labwork = x.labwork.label
    const group = x.group.label
    return `${labwork} - Gruppe ${group}`
  }
}
