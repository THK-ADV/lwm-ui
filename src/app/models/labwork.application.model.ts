import {LabworkAtom} from './labwork.model'
import {User} from './user.model'

export interface LabworkApplication {
    labwork: string
    applicant: string
    friends: string[]
    lastModified: Date
    id: string
}

export interface LabworkApplicationProtocol {
    labwork: string
    applicant: string
    friends: string[]
}

export interface LabworkApplicationAtom {
    labwork: LabworkAtom
    applicant: User
    friends: User[]
    lastModified: Date
    id: string
}
