import { ReportCardRescheduledAtom } from "./report-card-rescheduled.model"
import { maxBy } from "../utils/functions"

export const latestReportCardReschedule = (
  reschedules?: ReportCardRescheduledAtom[],
): ReportCardRescheduledAtom | undefined =>
  reschedules &&
  maxBy(
    reschedules,
    (a, b) => a.lastModified.getTime() > b.lastModified.getTime(),
  )
