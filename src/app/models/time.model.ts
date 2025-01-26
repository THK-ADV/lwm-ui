export class Time {
  private constructor(
    readonly date: Date,
    readonly hour: number,
    readonly minute: number,
    readonly seconds: number,
  ) {}

  // parses numbers out of 'HH:mm:ss'. fallback are 0 for time values
  static fromTimeString(timeString: string, date?: Date): Time {
    date = date || new Date(+0)
    const time = splitToNumbers(timeString)
    const h = time.shift() || 0
    const m = time.shift() || 0
    const s = time.shift() || 0

    date = new Date(date.setHours(h, m, s))
    return this.fromDate(date)
  }

  static fromDate(date: Date): Time {
    return new Time(date, date.getHours(), date.getMinutes(), date.getSeconds())
  }

  static startOfTheDay(): Time {
    return this.fromTimeString("00:00:00")
  }

  static endOfTheDay(): Time {
    return this.fromTimeString("23:59:59")
  }

  static withNewDate(date: Date, time: Time): Time {
    date = new Date(date.setHours(time.hour, time.minute, time.seconds))
    return this.fromDate(date)
  }

  equals = (that: Time): boolean =>
    this.hour === that.hour &&
    this.minute === that.minute &&
    this.seconds === that.seconds
}

export const isNumber = (value: any): value is number => !isNaN(value)

export const splitToNumbers = (timeString: string): number[] =>
  timeString.split(":").map(Number).filter(isNumber)
