import {User} from '../models/user.model'
import {Role} from '../models/role.model'

export const isUser = (any: any): any is User => {
    return (any as User).lastname !== undefined
}

export const isRole = (any: any): any is Role => {
    return (any as Role).label !== undefined
}
