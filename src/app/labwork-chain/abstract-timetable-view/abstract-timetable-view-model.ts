import {TimetableEntryAtom} from '../../models/timetable'
import {isEmpty} from '../../utils/functions'
import {User} from '../../models/user.model'

export interface SupervisorWorkload {
    user: User
    workload: number
}

const workload0 = (entries: TimetableEntryAtom[]) => entries.reduce(
    (acc: { user: string, minutes: number }, e) => {
        if (isEmpty(e.supervisor)) {
            return acc
        }

        const hours = (e.end.hour - e.start.hour) * 60
        const minutes = e.end.minute - e.start.minute

        e.supervisor.forEach(s => {
            const k = s.id
            acc[k] = acc[k] || 0
            acc[k] = acc[k] + hours + minutes
        })

        return acc
    },
    {}
)

export const calculateWorkload = (entries: TimetableEntryAtom[]): SupervisorWorkload[] => {
    const supervisors = entries.flatMap(e => e.supervisor)
    const workload = workload0(entries)

    return Object
        .keys(workload)
        .map(id => {
            // tslint:disable-next-line:no-non-null-assertion
            return {user: supervisors.find(s => s.id === id)!!, workload: workload[id] / 60.0}
        })
}
