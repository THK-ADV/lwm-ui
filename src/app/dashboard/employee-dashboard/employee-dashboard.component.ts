import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import { Subscription } from 'rxjs';
import {
    CalendarView,
    eventEntriesForList,
    eventEntriesForMonth,
    ExtendedProps,
    ScheduleEntryEvent,
    supervisorLabel,
} from 'src/app/labwork-chain/schedule/view/schedule-view-model';
import { CourseAtom } from 'src/app/models/course.model';
import { EmployeeDashboard } from 'src/app/models/dashboard.model';
import { ScheduleEntryAtom, ScheduleEntryAtomJSON } from 'src/app/models/schedule-entry.model';
import { Semester } from 'src/app/models/semester.model';
import { Time } from 'src/app/models/time.model';
import { ScheduleEntryService } from 'src/app/services/schedule-entry.service';
import { CALENDAR_ENTRY_COLOR } from 'src/app/utils/colors';
import { _groupBy, subscribe, foldUndefined, exists, minBy } from 'src/app/utils/functions';

import { DashboardService } from '../../services/dashboard.service';
import { KeycloakTokenService, KeycloakTokenKey } from 'src/app/services/keycloak-token.service';
import { map } from 'rxjs/operators';


@Component({
    selector: 'app-employee-dashboard',
    templateUrl: './employee-dashboard.component.html',
    styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
    private readonly subs: Subscription[]
    private dashboard: EmployeeDashboard
    private semester: Semester
    private courses: CourseAtom[]
    private scheduleEntries: ScheduleEntryAtom[]
    private filterSwitch: boolean = true

    private allDates: ScheduleEntryEvent[]
    private readonly calendarPlugins = [dayGridPlugin, listPlugin]

    @ViewChild('calendar', { static: false }) calendar: FullCalendarComponent


    constructor(
        private readonly dashboardService: DashboardService,
        private readonly route: ActivatedRoute,
        private readonly scheduleEntryService: ScheduleEntryService,
        private readonly tokenService: KeycloakTokenService
    ) {
        this.subs = []
        this.allDates = []
    }

    ngOnInit() {
        this.subs.push(subscribe(this.dashboardService.getEmployeeDashboard(), this.setValues));
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe)
    }

    setValues = (dashboard: EmployeeDashboard) => {
        // console.log("Dashboard-Content:", dashboard)
        this.dashboard = dashboard
        this.semester = dashboard.semester
        this.prepareEntriesForDisplay(dashboard.scheduleEntries)
    }

    prepareEntriesForDisplay(scheduleEntries: ScheduleEntryAtom[]) {
        this.allDates = this.groupEntriesByCourse(scheduleEntries)
            .flatMap((es, i) => this.makeScheduleEntryEvents(es, CALENDAR_ENTRY_COLOR[i].background, CALENDAR_ENTRY_COLOR[i].font))

        console.log(this.allDates)
    }

    groupEntriesByCourse = (entries: ScheduleEntryAtom[]) => {
        const g: { key: string, value: ScheduleEntryAtom[] } = _groupBy<ScheduleEntryAtom>(entries, x => x.labwork.course.id)

        const z: ScheduleEntryAtom[][] = Object.keys(g).reduce((acc, key) => {
            acc.push(g[key])
            return acc
        }, [[]])

        return z
    }

    makeScheduleEntryEvents = (entries: Readonly<ScheduleEntryAtom[]>, bg: string, fg: string): ScheduleEntryEvent[] => {
        return entries.map(this.makeScheduleEntryEvent(bg, fg))
    }

    makeScheduleEntryEvent = (bg: string, fg: string): (e: ScheduleEntryAtom) => ScheduleEntryEvent => {
        return e => {
            const props = {
                supervisorLabel: supervisorLabel(e.supervisor),
                roomLabel: e.room.label,
                group: e.group,
                labworkLabel: e.labwork.label
            }

            return {
                allDay: false,
                start: Time.withNewDate(e.date, e.start).date,
                end: Time.withNewDate(e.date, e.end).date,
                title: this.eventTitle('month', props),
                borderColor: bg,
                backgroundColor: bg,
                textColor: fg,
                extendedProps: props
            }
        }
    }

    eventTitle = (view: CalendarView, props: ExtendedProps) => { // wrong eventTitle-fun is used
        switch (view) {
            case 'month':
                return `- ${props.labworkLabel}: Grp. ${props.group.label} - ${props.roomLabel}`
            case 'list':
                return `${props.labworkLabel}: Grp. ${props.group.label} - ${props.roomLabel}: ${props.supervisorLabel}`
        }
    }

    private earliestDate = () => {
        const min = minBy(this.dashboard.scheduleEntries, (lhs, rhs) => lhs.date.getTime() < rhs.date.getTime())
        return foldUndefined(min, s => s.date, () => this.semester.start)
    }

    private semesterBoundaries = () => ({
        start: this.semester.start,
        end: this.semester.end
    })


    private showMonthView = () => {
        this.allDates = eventEntriesForMonth(this.allDates)
        this.calendar.getApi().changeView('dayGridMonth')
    }

    private showListView = () => {
        this.allDates = eventEntriesForList(this.allDates)
        this.calendar.getApi().changeView('listWeek')
    }

    showMyAssignments = () => {
        const id = this.tokenService.get(KeycloakTokenKey.SYSTEMID)

        if (!id) {
            return
        }

        this.prepareEntriesForDisplay(this.dashboard.scheduleEntries.filter(e => exists(e.supervisor, u => u.systemId === id)))
    }

    showAllAssignments = () => {

        this.prepareEntriesForDisplay(this.dashboard.scheduleEntries)
    }

    showFilteredAssignments = () => {
        if (this.calendar.customButtons && this.calendar.customButtons.filteredassignments) {

            const filterButton = this.calendar.customButtons.filteredassignments

            if (this.filterSwitch) {
                this.showMyAssignments()
                filterButton.text = 'Alle Termine anzeigen'
                this.calendar.getApi().render()
            } else {
                this.showAllAssignments()
                filterButton.text = 'Meine Termine anzeigen'
                this.calendar.getApi().render()
            }
            this.filterSwitch = !this.filterSwitch
        }

    }

}