import {Observable, Subscription} from 'rxjs'

export const pipe = <T extends any[], R>(
    fn1: (...args: T) => R,
    ...fns: Array<(a: R) => R>
) => {
    const piped = fns.reduce(
        (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
        value => value
    )
    return (...args: T) => piped(fn1(...args))
}

export const compose = <R>(fn1: (a: R) => R, ...fns: Array<(a: R) => R>) =>
    fns.reduce((prevFn, nextFn) => value => prevFn(nextFn(value)), fn1)

export function exists<T>(array: T[], p: (T) => boolean): boolean {
    return array.find(p) !== undefined
}

export function zip<A, B>(first: Array<A>, second: Array<B>): Array<A & B> {
    if (first.length !== second.length) {
        return []
    }

    return first.map((e, i) => {
        return Object.assign(e, second[i])
    })
}

export function NotImplementedError(data: string = ''): never {
    throw new Error(`not implemented yet - ${data}`)
}

export function subscribe<T>(observable: Observable<T>, next: (t: T) => void): Subscription {
    return observable.subscribe(e => {
        if (e) {
            next(e)
        }
    })
}
