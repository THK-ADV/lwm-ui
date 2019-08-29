export function nestedObjectSortingDataAccessor<T>(item: T, property: string) {
    if (property.includes('.')) {
        return property.split('.')
            .reduce((object, key) => object[key], item)
    }
    return item[property]
}
