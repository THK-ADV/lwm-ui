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

export const mapMap = <K, V, T>(map: Map<K, V[]>, f: (k: K, v: V[]) => T): T[] => {
    const xs: T[] = []
    map.forEach((v, k) => xs.push(f(k, v)))
    return xs
}
