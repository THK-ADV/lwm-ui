import {StudentAtom, User} from '../models/user.model'
import {Role} from '../models/role.model'
import {Room} from '../models/room.model'

export const isUser = (any: any): any is User => {
    return (any as User)?.lastname !== undefined
}

export const isStudentAtom = (any: any): any is StudentAtom => {
    return (any as StudentAtom)?.enrollment?.id !== undefined
}

export const isRole = (any: any): any is Role => {
    return (any as Role)?.label !== undefined
}

export const isRoom = (any: any): any is Room => {
    return (any as Room)?.capacity !== undefined
}

export const isDate = (any: any): any is Date => {
    return (any as Date)?.getDay() !== undefined
}

export const isString = (any: any): any is string => {
    return (any as string)?.charAt !== undefined
}
