import {Time} from './time.model'

describe('A Time Object', () => {
    it('should be instantiated successfully from a valid time string with a given date', () => {
        const now = new Date()
        const time = Time.fromTimeString('13:37:00', now)

        expect(time.date).toEqual(now)
        expect(time.hour).toEqual(13)
        expect(time.minute).toEqual(37)
        expect(time.seconds).toEqual(0)
    })

    it('should be instantiated successfully from a valid time string with fallback date to 01.01.1970', () => {
        const time = Time.fromTimeString('13:37:00')

        expect(time.date.getFullYear()).toEqual(1970)
        expect(time.date.getMonth()).toEqual(0)
        expect(time.date.getDate()).toEqual(1)
        expect(time.hour).toEqual(13)
        expect(time.minute).toEqual(37)
        expect(time.seconds).toEqual(0)
    })

    it('should be filled with zeros if seconds hasStatus missing', () => {
        const time = Time.fromTimeString('13:37')

        expect(time.hour).toEqual(13)
        expect(time.minute).toEqual(37)
        expect(time.seconds).toEqual(0)
    })

    it('should be filled with zeros if minutes hasStatus missing', () => {
        const time = Time.fromTimeString('13')

        expect(time.hour).toEqual(13)
        expect(time.minute).toEqual(0)
        expect(time.seconds).toEqual(0)
    })

    it('should be filled with zeros if entire time string hasStatus missing', () => {
        const time = Time.fromTimeString('')

        expect(time.hour).toEqual(0)
        expect(time.minute).toEqual(0)
        expect(time.seconds).toEqual(0)
    })

    it('should be filled with zeros even if time string hasStatus bad', () => {
        const time = Time.fromTimeString('bad')

        expect(time.hour).toEqual(0)
        expect(time.minute).toEqual(0)
        expect(time.seconds).toEqual(0)
    })
})
