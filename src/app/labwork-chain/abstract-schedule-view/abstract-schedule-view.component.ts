import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { CalendarOptions, FullCalendarComponent } from "@fullcalendar/angular";
import { LabworkAtom } from "../../models/labwork.model";
import { TimetableAtom } from "../../models/timetable";
import {
  CalendarView,
  makeBlacklistEvents,
  ScheduleEntryEvent,
  scheduleEntryEventTitleShort,
  ScheduleEntryProps,
} from "../schedule/view/schedule-view-model";

@Component({
  selector: "lwm-abstract-schedule-view",
  templateUrl: "./abstract-schedule-view.component.html",
  styleUrls: ["./abstract-schedule-view.component.scss"],
})
export class AbstractScheduleViewComponent implements OnInit {
  @Input() labwork: Readonly<LabworkAtom>;
  @Input() timetable: Readonly<TimetableAtom>;

  @Input() set dates(dates: ScheduleEntryEvent<ScheduleEntryProps>[]) {
    this.allDates = dates.concat(
      makeBlacklistEvents(this.timetable.localBlacklist)
    );
    this.calendarOptions.events = this.allDates;
  }

  @ViewChild("calendar") calendar: FullCalendarComponent;

  allDates: ScheduleEntryEvent<ScheduleEntryProps>[] = [];

  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    locale: "de",
    nowIndicator: true,
    weekends: false,
    firstDay: 1,
    headerToolbar: {
      left: "month, list, labworkStart",
      center: "title",
      right: "prev,next",
    },
    buttonText: { month: "Monat", list: "Liste" },
    dayHeaderFormat: { weekday: "long" },
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      omitZeroMinute: false,
      meridiem: false,
    },
    weekNumbers: true,
  };

  ngOnInit() {
    this.calendarOptions.customButtons = {
      labworkStart: {
        text: "Praktikumsbeginn",
        click: this.showLabworkStartDate,
      },
      month: { text: "Monat", click: this.showMonthView },
      list: { text: "Liste", click: this.showListView },
    };
    this.calendarOptions.validRange = {
      start: this.labwork.semester.start,
      end: this.labwork.semester.end,
    };
    this.calendarOptions.initialDate = this.timetable.start;
  }

  showLabworkStartDate = () =>
    this.calendar.getApi().gotoDate(this.timetable.start);

  showMonthView = () => {
    this.updateTitle("month");
    this.calendar.getApi().changeView("dayGridMonth");
  };

  showListView = () => {
    this.updateTitle("list");
    this.calendar.getApi().changeView("listWeek");
  };

  private updateTitle = (view: CalendarView) => {
    this.allDates = this.allDates.map((d) => {
      const copy = { ...d };

      if (copy.extendedProps) {
        copy.title = scheduleEntryEventTitleShort(view, copy.extendedProps);
      }

      return copy;
    });
    this.calendarOptions.events = this.allDates;
  };
}
