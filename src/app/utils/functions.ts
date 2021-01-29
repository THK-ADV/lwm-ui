import {Observable, Subscription} from 'rxjs'
import {isNumber} from '../models/time.model'

export const compose = <A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C => a => g(f(a))

export const exists = <T>(array: Readonly<T[]>, p: (t: T) => boolean): boolean => {
    for (const x of array) {
        if (p(x)) {
            return true
        }
    }
    return false
}

export function zip<A, B>(first: Array<A>, second: Array<B>): Array<A & B> {
    if (first.length !== second.length) {
        return []
    }

    return first.map((e, i) => {
        return Object.assign(e, second[i])
    })
}

export const mapJoin = <A>(
    xs: Array<A>,
    separator: string,
    f: (a: A) => string
) => xs.reduce((acc, t) => `${acc}${separator}${f(t)}`, '')

export function _groupBy<T>(array: Readonly<T[]>, key: (t: T) => string): { key: string, value: T[] } {
    // @ts-ignore
    return array.reduce((acc, x) => {
        const k = key(x)
        acc[k] = acc[k] || []
        acc[k].push(x)
        return acc
    }, {})
}

export const count = <T>(xs: Readonly<T[]>, p: (t: T) => boolean): number => {
    return xs.reduce((i, x) => p(x) ? i + 1 : i, 0)
}

export function NotImplementedError(data: string = ''): never {
    throw new Error(`not implemented yet - ${data}`)
}

export function subscribe<T>(observable: Observable<T>, next: (t: T) => void): Subscription {
    return observable.subscribe(e => {
        if (isNumber(e)) {
            next(e)
        } else {
            foldUndefined(e, next, () => {
            })
        }
    })
}

export const foldUndefined = <T, U>(t: T | undefined, f: (t: T) => U, nil: () => U): U =>
    t !== undefined ? f(t) : nil()

export const mapUndefined = <T, U>(t: T | undefined, f: (t: T) => U): U | undefined =>
    foldUndefined(t, f, () => undefined)

export const parseUnsafeBoolean = (any: any): boolean => !!any

export const parseUnsafeNumber = (any: any): number => +any

export const parseUnsafeString = (any: any): string => '' + any

export const between = (x: number, min: number, max: number): boolean => x >= min && x <= max

export const voidF = () => {
}

export const isEmpty = <T>(xs: Readonly<Array<T>>): boolean => xs.length === 0

export const nonEmpty = <T>(xs: Readonly<Array<T>>): boolean => !isEmpty(xs)

export const maxBy = <T>(xs: Readonly<Array<T>>, higher: (lhs: T, rhs: T) => boolean): T | undefined => {
    if (isEmpty(xs)) {
        return undefined
    }

    return xs.reduce((lhs, rhs) => higher(lhs, rhs) ? lhs : rhs)
}

export const minBy = <T>(xs: Readonly<Array<T>>, lower: (lhs: T, rhs: T) => boolean): T | undefined => {
    if (isEmpty(xs)) {
        return undefined
    }

    return xs.reduce((lhs, rhs) => lower(lhs, rhs) ? lhs : rhs)
}

export const assertNotUndefined = (...values: Array<any>) => {
    const msg = () => values.map((v, i) => v === undefined ? i : -1).filter(v => v !== -1).join(', ')
    console.assert(values.every(v => v !== undefined), `values at index ${msg()} are undefined`)
}

export const dateOrderingASC = (lhs: Date, rhs: Date): number => lhs.getTime() - rhs.getTime()

export const dateOrderingDESC = (lhs: Date, rhs: Date): number => rhs.getTime() - lhs.getTime()

export const isInThePast = (date: Date, reference: Date = new Date) =>
    date.getTime() > reference.getTime()

export const first = <T>(xs: Readonly<Array<T>>): T | undefined => isEmpty(xs) ? undefined : xs[0]

export const partitionWith = <A, B>(xs: Readonly<Array<A>>, p: (t: A) => B | undefined): [B[], A[]] => {
    const match: B[] = []
    const noMatch: A[] = []

    xs.forEach(x => {
        const res = p(x)
        if (res) {
            match.push(res)
        } else {
            noMatch.push(x)
        }
    })

    return [match, noMatch]
}

export const partition = <A, B>(xs: Readonly<Array<A>>, p: (t: A) => boolean): [A[], A[]] => {
    const match: A[] = []
    const noMatch: A[] = []

    xs.forEach(x => {
        if (p(x)) {
            match.push(x)
        } else {
            noMatch.push(x)
        }
    })

    return [match, noMatch]
}

export const distinctBy = <A, B>(xs: Readonly<A[]>, f: (a: A) => B): A[] => {
    const distinct: A[] = []

    xs.forEach(x => {
        if (!exists(distinct, a => f(a) === f(x))) {
            distinct.push(x)
        }
    })

    return distinct
}

export const isDefined = <A>(a: A | undefined): a is A =>
    a !== undefined

export const filterIsDefined = <A>(xs: Readonly<Array<A | undefined>>): A[] =>
    xs.filter(isDefined)
