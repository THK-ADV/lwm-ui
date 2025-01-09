import { ScheduleEntryAtom } from "../../../models/schedule-entry.model"
import { Time } from "../../../models/time.model"
import { Blacklist } from "../../../models/blacklist.model"
import { color, whiteColor } from "../../../utils/colors"
import { User } from "../../../models/user.model"
import { Group } from "../../../models/group.model"
import { shortUserName } from "../../timetable/timetable-view-model"
import { Room } from "../../../models/room.model"

export type CalendarView = "month" | "list"

export interface ScheduleEntryProps {
  supervisorLabel: string
  roomLabel: string
  group: Group
}

export interface ScheduleEntryEvent<Props> {
  title: string
  start: Date
  end: Date
  allDay: boolean
  borderColor: string
  backgroundColor: string
  textColor: string
  extendedProps?: Props
}

export const scheduleEntryProps = (
  supervisors: User[],
  room: Room,
  group: Group,
) => ({
  supervisorLabel: supervisorLabel(supervisors),
  roomLabel: room.label,
  group: group,
})

export const makeScheduleEntryEvents = (
  entries: Readonly<ScheduleEntryAtom[]>,
): ScheduleEntryEvent<ScheduleEntryProps>[] => {
  const go = (e: ScheduleEntryAtom): ScheduleEntryEvent<ScheduleEntryProps> => {
    const backgroundColor = color("primary")
    const foregroundColor = whiteColor()
    const props = scheduleEntryProps(e.supervisor, e.room, e.group)

    return {
      allDay: false,
      start: Time.withNewDate(e.date, e.start).date,
      end: Time.withNewDate(e.date, e.end).date,
      title: scheduleEntryEventTitleShort("month", props),
      borderColor: backgroundColor,
      backgroundColor: backgroundColor,
      textColor: foregroundColor,
      extendedProps: props,
    }
  }

  return entries.map(go)
}

export const scheduleEntryEventTitleShort = (
  view: CalendarView,
  props: ScheduleEntryProps,
) => {
  switch (view) {
    case "month":
      return `- Grp. ${props.group.label} - ${props.roomLabel}`
    case "list":
      return `Grp. ${props.group.label} - ${props.roomLabel}: ${props.supervisorLabel}`
  }
}

export const scheduleEntryEventTitleLong = (
  view: CalendarView,
  e: ScheduleEntryAtom,
) => {
  switch (view) {
    case "month":
      return `${e.labwork.label} in ${e.room.label} (Grp. ${e.group.label})`
    case "list":
      return `${e.labwork.label} in ${e.room.label} (Grp. ${e.group.label}): ${supervisorLabel(e.supervisor)}`
  }
}

export const makeBlacklistEvents = (
  blacklists: Blacklist[],
): ScheduleEntryEvent<never>[] => {
  const go = (b: Blacklist): ScheduleEntryEvent<never> => {
    const backgroundColor = color("warn")
    const foregroundColor = whiteColor()

    return {
      allDay: true,
      start: Time.withNewDate(b.date, b.start).date,
      end: Time.withNewDate(b.date, b.end).date,
      title: b.label,
      borderColor: backgroundColor,
      backgroundColor: backgroundColor,
      textColor: foregroundColor,
    }
  }

  return blacklists.map(go)
}

const supervisorLabel = (supervisors: User[]): string => {
  return supervisors
    .sort((lhs, rhs) => lhs.lastname.localeCompare(rhs.lastname))
    .map(shortUserName)
    .join(", ")
}
