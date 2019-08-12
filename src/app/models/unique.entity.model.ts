export interface UniqueEntity {
    id: string
}

export function isUniqueEntity<A extends UniqueEntity, B>(object: A | B): object is A {
    return (object as A).id !== undefined
}
