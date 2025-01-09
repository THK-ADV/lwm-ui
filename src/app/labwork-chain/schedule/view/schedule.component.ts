import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core"
import { LabworkAtom } from "../../../models/labwork.model"
import { ScheduleEntryAtom } from "../../../models/schedule-entry.model"
import {
  makeScheduleEntryEvents,
  ScheduleEntryEvent,
  ScheduleEntryProps,
} from "./schedule-view-model"
import { TimetableAtom } from "../../../models/timetable"
import { DeleteDialogComponent } from "../../../shared-dialogs/delete/delete-dialog.component"
import { MatDialog } from "@angular/material/dialog"
import { ReportCardEntryService } from "../../../services/report-card-entry.service"
import { ScheduleEntryService } from "../../../services/schedule-entry.service"
import { subscribeDeleteDialog } from "../../../shared-dialogs/dialog-open-combinator"
import { Observable, Subscription } from "rxjs"
import {
  deleteReportCardEntries,
  deleteSchedule,
} from "../preview/schedule-preview-view-model"
import { switchMap } from "rxjs/operators"
import { updateLabwork$ } from "../../../labworks/labwork-view-model"
import { LabworkService } from "../../../services/labwork.service"
import { LoadingService, withSpinning } from "../../../services/loading.service"
import { compose } from "../../../utils/functions"
import { ActionType } from "../../../abstract-header/abstract-header.component"

@Component({
  selector: "lwm-schedule",
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.scss"],
  standalone: false,
})
export class ScheduleComponent implements OnInit {
  @Input() labwork: Readonly<LabworkAtom>
  @Input() scheduleEntries: Readonly<ScheduleEntryAtom[]>
  @Input() timetable: Readonly<TimetableAtom>
  @Input() hasReportCards: Readonly<boolean>
  @Input() hasPermission: Readonly<boolean>

  @Output() deleteScheduleEmitter: EventEmitter<void>
  @Output() deleteReportCardsEmitter: EventEmitter<void>
  @Output() updateLabworkEmitter: EventEmitter<LabworkAtom>

  dates: ScheduleEntryEvent<ScheduleEntryProps>[]
  headerTitle: string
  private readonly subs: Subscription[]

  constructor(
    private readonly dialog: MatDialog,
    private readonly scheduleService: ScheduleEntryService,
    private readonly reportCardService: ReportCardEntryService,
    private readonly labworkService: LabworkService,
    private readonly loadingService: LoadingService,
  ) {
    this.deleteScheduleEmitter = new EventEmitter<void>()
    this.deleteReportCardsEmitter = new EventEmitter<void>()
    this.updateLabworkEmitter = new EventEmitter<LabworkAtom>()
    this.subs = []
  }

  ngOnInit() {
    console.log("schedule component loaded")

    this.headerTitle = `Staffelplan für ${this.labwork.label}`
    this.updateCalendar(this.scheduleEntries)
  }

  private updateCalendar = (scheduleEntries: Readonly<ScheduleEntryAtom[]>) => {
    console.log("updating schedule cal")
    this.dates = makeScheduleEntryEvents(scheduleEntries)
  }

  canDelete = (): ActionType[] =>
    this.hasPermission ? [{ type: "delete", label: undefined }] : []

  onDelete = () => {
    const dialogRef = DeleteDialogComponent.instance(this.dialog, {
      id: this.labwork.id,
      label: this.hasReportCards
        ? "Staffelplan inkl. Notenhefte"
        : "Staffelplan",
    })

    const s = subscribeDeleteDialog(
      dialogRef,
      compose(this.delete$, withSpinning(this.loadingService)),
      this.emitAfterDelete,
      console.log,
    )

    this.subs.push(s)
  }

  private emitAfterDelete = () => {
    this.deleteScheduleEmitter.emit()
    this.deleteReportCardsEmitter.emit()
  }

  private delete$ = (): Observable<unknown> => {
    const resetSchedule$ = () =>
      deleteSchedule(
        this.labwork.course.id,
        this.labwork.id,
        this.scheduleService,
      )
    const resetAll$ = () =>
      resetSchedule$().pipe(
        switchMap((_) =>
          deleteReportCardEntries(
            this.labwork.course.id,
            this.labwork.id,
            this.reportCardService,
          ),
        ),
        switchMap((_) =>
          updateLabwork$(this.labworkService, this.labwork, (u) => ({
            ...u,
            published: false,
          })),
        ),
      )

    return this.hasReportCards ? resetAll$() : resetSchedule$()
  }
}
