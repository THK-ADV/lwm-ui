import localDE from "@angular/common/locales/de"
import { formatDate, registerLocaleData } from "@angular/common"
import { Time } from "../models/time.model"
import { Injectable } from "@angular/core"
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  NativeDateAdapter,
} from "@angular/material/core"

export const LWM_DATE_FORMATS = {
  display: {
    dateInput: "localDate",
    monthYearLabel: "monthYearLabel",
  },
}

export type DateTimePattern =
  | "yyyy-MM-dd"
  | "dd.MM.yyyy"
  | "dd.MM.yyyy - HH:mm"
  | "dd.MM"

export type TimePattern = "HH:mm:ss" | "HH:mm"

export const format = (
  date: Date,
  pattern: DateTimePattern | TimePattern,
): string => {
  registerLocaleData(localDE, "de")
  return formatDate(date, pattern, "de")
}

export const formatTime = (
  time: Time,
  pattern: TimePattern = "HH:mm:ss",
): string => format(time.date, pattern)

@Injectable()
export class LWMDateAdapter extends NativeDateAdapter {
  static defaultProviders = () => [
    { provide: DateAdapter, useClass: LWMDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: LWM_DATE_FORMATS },
  ]

  getFirstDayOfWeek = (): number => 1

  format = (date: Date, displayFormat: Object): string => {
    switch (displayFormat) {
      case LWM_DATE_FORMATS.display.dateInput:
        return format(date, "dd.MM.yyyy")
      case LWM_DATE_FORMATS.display.monthYearLabel:
        return date.toLocaleDateString("de-DE", {
          month: "short",
          year: "numeric",
        })
      default:
        return super.format(date, displayFormat)
    }
  }
}
