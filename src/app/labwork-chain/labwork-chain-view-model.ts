import {TimetableService} from '../services/timetable.service'
import {LabworkAtom} from '../models/labwork.model'
import {TimetableAtom} from '../models/timetable'
import {Subscription} from 'rxjs'
import {subscribe} from '../utils/functions'
import {fetchLabwork$} from '../utils/component.utils'
import {ActivatedRoute} from '@angular/router'
import {LabworkService} from '../services/labwork.service'
import {ScheduleEntryService} from '../services/schedule-entry.service'
import {ScheduleEntryAtom} from '../models/schedule-entry.model'

export const fetchTimetable = (
    service: TimetableService,
    labwork: LabworkAtom,
    completion: (t: TimetableAtom) => void
): Subscription => {
    return subscribe(
        service.getAllWithFilter(
            labwork.course.id,
            {attribute: 'labwork', value: labwork.id}
        ),
        timetables => {
            const timetable = timetables.shift()

            if (timetable) {
                completion(timetable)
            }
        }
    )
}

export const fetchLabwork = (
    route: ActivatedRoute,
    labworkService: LabworkService,
    completion: (l: LabworkAtom) => void
): Subscription => {
    return subscribe(fetchLabwork$(route, labworkService), completion)
}

export const fetchScheduleEntries = (
    service: ScheduleEntryService,
    labwork: LabworkAtom,
    completion: (es: ScheduleEntryAtom[]) => void
): Subscription => {
    return subscribe(service.getAllWithFilter(labwork.course.id, labwork.id), completion)
}
