import { User } from '../models/user.model'

export function nestedObjectSortingDataAccessor<T>(item: T, property: string) {
  if (property.includes('.')) {
    return property.split('.').reduce((object, key) => object[key], item)
  }
  return item[property]
}

export const compareUsers = (lhs: User, rhs: User): number =>
  lhs.lastname.localeCompare(rhs.lastname)
