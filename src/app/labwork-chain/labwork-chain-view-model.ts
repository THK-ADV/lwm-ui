import {TimetableService} from '../services/timetable.service'
import {LabworkAtom} from '../models/labwork.model'
import {TimetableAtom, TimetableProtocol} from '../models/timetable'
import {Observable, of, Subscription} from 'rxjs'
import {subscribe} from '../utils/functions'
import {fetchLabwork$} from '../utils/component.utils'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {ScheduleEntryService} from '../services/schedule-entry.service'
import {ScheduleEntryAtom} from '../models/schedule-entry.model'
import {AssignmentPlan} from '../models/assignment-plan.model'
import {AssignmentPlanService} from '../services/assignment-plan.service'
import {map, switchMap} from 'rxjs/operators'
import {format} from '../utils/lwmdate-adapter'
import {BlacklistService} from '../services/blacklist.service'
import {Blacklist} from '../models/blacklist.model'
import {Semester} from '../models/semester.model'
import {LabworkApplicationService} from '../services/labwork-application.service'

export const fetchLabwork = (
    route: ActivatedRoute,
    labworkService: LabworkService,
    completion: (l: LabworkAtom) => void
): Subscription => {
    return subscribe(fetchLabwork$(route, labworkService), completion)
}

export const fetchScheduleEntries = (
    service: ScheduleEntryService,
    labwork: LabworkAtom
): Observable<ScheduleEntryAtom[]> => {
    return service.getAllWithFilter(labwork.course.id, labwork.id)
}

export const fetchOrCreateAssignmentPlan = (
    service: AssignmentPlanService,
    labwork: LabworkAtom
): Observable<AssignmentPlan> => fetchAssignmentPlan(service, labwork).pipe(
    switchMap(ap => ap ? of(ap) : createAssignmentPlanSkeleton(service, labwork))
)

export const fetchOrCreateTimetable = (
    timetableService: TimetableService,
    blacklistService: BlacklistService,
    labwork: LabworkAtom
): Observable<TimetableAtom> => {
    return fetchTimetable(timetableService, labwork).pipe(
        switchMap(tt => tt ? of(tt) : createTimetableSkeleton(timetableService, blacklistService, labwork))
    )
}

export const fetchApplicationCount = (
    service: LabworkApplicationService,
    labwork: LabworkAtom
): Observable<number> => service.getApplicationCount(labwork.id)

const fetchAssignmentPlan = (
    service: AssignmentPlanService,
    labwork: LabworkAtom
): Observable<AssignmentPlan | undefined> => {
    return service.getAllWithFilter(labwork.course.id, {attribute: 'labwork', value: labwork.id}).pipe(
        map(xs => xs.shift())
    )
}

const createAssignmentPlanSkeleton = (
    service: AssignmentPlanService,
    labwork: LabworkAtom
): Observable<AssignmentPlan> => {
    return service.create(labwork.course.id, {labwork: labwork.id, entries: [], attendance: 0, mandatory: 0})
}

const fetchTimetable = (
    service: TimetableService,
    labwork: LabworkAtom
): Observable<TimetableAtom | undefined> => {
    return service.getAllWithFilter(labwork.course.id, {attribute: 'labwork', value: labwork.id}).pipe(
        map(xs => xs.shift())
    )
}

const createTimetableSkeleton = (
    timetableService: TimetableService,
    blacklistService: BlacklistService,
    labwork: LabworkAtom
): Observable<TimetableAtom> => {
    const protocol = (bls: Blacklist[]): TimetableProtocol => ({
        labwork: labwork.id,
        start: format(labwork.semester.start, 'yyyy-MM-dd'),
        entries: [],
        localBlacklist: bls.map(b => b.id)
    })

    return globalBlacklistsWithinSemester(blacklistService, labwork.semester).pipe(
        switchMap(bls => timetableService.create(labwork.course.id, protocol(bls)))
    )
}

const globalBlacklistsWithinSemester = (
    service: BlacklistService,
    semester: Semester
): Observable<Blacklist[]> => {
    return service.getAllWithFilter(
        {attribute: 'global', value: 'true'},
        {attribute: 'since', value: format(semester.start, 'yyyy-MM-dd')},
        {attribute: 'until', value: format(semester.end, 'yyyy-MM-dd')},
    )
}
