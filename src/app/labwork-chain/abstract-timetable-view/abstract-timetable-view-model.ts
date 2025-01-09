import { TimetableEntryAtom } from "../../models/timetable"
import { isEmpty } from "../../utils/functions"
import { User } from "../../models/user.model"

export interface SupervisorWorkload {
  user: User
  workload: number
}

// @ts-ignore
const workload0 = (entries: TimetableEntryAtom[]) => {
  const acc: { [key: string]: number } = {}

  for (const e of entries) {
    if (isEmpty(e.supervisor)) {
      continue
    }

    const hours = (e.end.hour - e.start.hour) * 60
    const minutes = e.end.minute - e.start.minute

    for (const s of e.supervisor) {
      const k = s.id
      acc[k] = acc[k] || 0
      acc[k] = acc[k] + hours + minutes
    }
  }

  return acc
}

export const calculateWorkload = (
  entries: TimetableEntryAtom[],
): SupervisorWorkload[] => {
  const supervisors = entries.flatMap((e) => e.supervisor)
  const workload = workload0(entries)

  return Object.keys(workload).map((id) => {
    // tslint:disable-next-line:no-non-null-assertion
    return {
      user: supervisors.find((s) => s.id === id)!!,
      workload: workload[id] / 60.0,
    }
  })
}
