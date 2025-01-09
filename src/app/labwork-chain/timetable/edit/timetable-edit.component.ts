import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core"
import { LabworkAtom } from "../../../models/labwork.model"
import { MatDialog } from "@angular/material/dialog"
import { TimetableService } from "../../../services/timetable.service"
import { subscribe } from "../../../utils/functions"
import { EMPTY, Observable, Subscription } from "rxjs"
import { TimetableAtom } from "../../../models/timetable"
import {
  TimetableEntryComponent,
  TimetableEntryDialogResult,
} from "../entry/timetable-entry.component"
import { AuthorityService } from "../../../services/authority.service"
import { filter, map, switchMap } from "rxjs/operators"
import { RoomService } from "../../../services/room.service"
import {
  CalendarEvent,
  createTimetableEntry$,
  removeTimetableEntry$,
  updateStartDate,
  updateSupervisorAndRoom,
  updateTime,
  updateTimetable$,
  updateTimetableEntry$,
} from "../timetable-view-model"
import { User } from "../../../models/user.model"
import { Room } from "../../../models/room.model"
import { DialogMode } from "../../../shared-dialogs/dialog.mode"
import { isDate } from "../../../utils/type.check.utils"
import { openDialog } from "../../../shared-dialogs/dialog-open-combinator"
import { AbstractTimetableViewComponent } from "../../abstract-timetable-view/abstract-timetable-view.component"

@Component({
  selector: "lwm-timetable-edit",
  templateUrl: "./timetable-edit.component.html",
  styleUrls: ["./timetable-edit.component.scss"],
  standalone: false,
})
export class TimetableEditComponent implements AfterViewInit, OnDestroy {
  @Input() labwork: Readonly<LabworkAtom>
  @Input() timetable: Readonly<TimetableAtom>
  @Input() hasPermission: Readonly<boolean>

  @Output() timetableUpdate: EventEmitter<TimetableAtom>

  @ViewChild(AbstractTimetableViewComponent)
  timetableComponent: AbstractTimetableViewComponent

  private subs: Subscription[]

  constructor(
    private readonly dialog: MatDialog,
    private readonly timetableService: TimetableService,
    private readonly authorityService: AuthorityService,
    private readonly roomService: RoomService,
  ) {
    this.timetableUpdate = new EventEmitter<TimetableAtom>()
    this.subs = []
  }

  ngAfterViewInit() {
    this.observeStartDateChanges()
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe())
  }

  private observeStartDateChanges = () => {
    this.updateCalendar$(
      this.timetableComponent.startDateControl().valueChanges.pipe(
        filter(isDate),
        switchMap((d) =>
          updateTimetable$(
            this.timetableService,
            this.timetable,
            updateStartDate(d),
          ),
        ),
      ),
    )
  }

  private updateCalendar = (t: TimetableAtom) => {
    console.log("updating cal")

    this.timetable = t
    this.timetableUpdate.emit(t)
  }

  private updateCalendar$ = (o: Observable<TimetableAtom>) => {
    this.subs.push(subscribe(o, this.updateCalendar))
  }

  onCopyEvent = (event: CalendarEvent) => {
    this.updateCalendar$(
      createTimetableEntry$(
        this.timetableService,
        this.timetable,
        event.extendedProps.supervisor,
        event.extendedProps.room,
        event.start,
        event.end,
      ),
    )
  }

  onDateSelection = (start: Date, end: Date) => {
    const dialogRef = this.timetableEntryDialog(DialogMode.create, [])

    this.updateCalendar$(openDialog(dialogRef, this.createIfNeeded(start, end)))
  }

  onEventClick = (event: CalendarEvent) => {
    const dialogRef = this.timetableEntryDialog(
      DialogMode.edit,
      this.timetable.entries[Number(event.id)].supervisor,
      event.extendedProps.room,
    )

    this.updateCalendar$(
      openDialog(dialogRef, this.updateIfNeeded(Number(event.id))),
    )
  }

  onEventDrop = (event: CalendarEvent) => {
    this.updateCalendar$(
      updateTimetableEntry$(
        this.timetableService,
        this.timetable,
        Number(event.id),
        updateTime(event.start, event.end),
      ),
    )
  }

  onEventResize = (event: CalendarEvent) => {
    this.updateCalendar$(
      updateTimetableEntry$(
        this.timetableService,
        this.timetable,
        Number(event.id),
        updateTime(event.start, event.end),
      ),
    )
  }

  private timetableEntryDialog = (
    mode: DialogMode,
    supervisors: User[],
    room?: Room,
  ) => {
    return TimetableEntryComponent.instance(
      this.dialog,
      mode,
      this.roomService.getAll(),
      supervisors,
      this.authorityService
        .getAuthoritiesForCourse(this.labwork.course.id)
        .pipe(map((xs) => xs.map((x) => x.user))),
      room,
    )
  }

  private updateIfNeeded = (
    id: number,
  ): ((reason: TimetableEntryDialogResult) => Observable<TimetableAtom>) => {
    return (reason) => {
      switch (reason.kind) {
        case "update":
          return updateTimetableEntry$(
            this.timetableService,
            this.timetable,
            id,
            updateSupervisorAndRoom(reason.room, reason.supervisors),
          )
        case "delete":
          return removeTimetableEntry$(
            this.timetableService,
            this.timetable,
            id,
          )
        case "cancel":
          return EMPTY
      }
    }
  }

  private createIfNeeded = (
    start: Date,
    end: Date,
  ): ((reason: TimetableEntryDialogResult) => Observable<TimetableAtom>) => {
    return (reason) => {
      switch (reason.kind) {
        case "update":
          return createTimetableEntry$(
            this.timetableService,
            this.timetable,
            reason.supervisors,
            reason.room,
            start,
            end,
          )
        case "delete":
        case "cancel":
          return EMPTY
      }
    }
  }
}
