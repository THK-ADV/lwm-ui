export interface Tuple<A, B> {
    readonly first: Readonly<A>
    readonly second: Readonly<B>
}

export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
