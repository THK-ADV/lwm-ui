// TODO use this instead of _groupBy

export const groupBy = <K, V>(xs: Readonly<V[]>, key: (v: V) => K): Map<K, V[]> => {
    const dict = new Map<K, V[]>()

    xs.forEach((x) => {
        const k = key(x)
        const collection = dict.get(k)
        if (!collection) {
            dict.set(k, [x])
        } else {
            collection.push(x)
        }
    })

    return dict
}

export const forEachMap = <K, V>(map: Map<K, V[]>, f: (k: K, v: V[], i: number) => void) => {
    let i = 0
    map.forEach((v, k) => f(k, v, i++))
}

export const toTupleArray = <K, V>(map: Map<K, V[]>): [K, V[]][] => {
    const xs: [K, V[]][] = []
    let i = 0
    forEachMap(map, (k, v) => xs[i++] = [k, v])
    return xs
}

export const mapMap = <K, V, T>(map: Map<K, V[]>, f: (k: K, v: V[]) => T): T[] => {
    const xs: T[] = []
    forEachMap(map, (k, v) => xs.push(f(k, v)))
    return xs
}
