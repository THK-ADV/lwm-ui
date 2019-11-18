import {Time} from './time.model'

export interface  Blacklist {
    label: string
    date: Date
    start: Time
    end: Time
    global: boolean
    id: string
}

export interface BlacklistProtocol {
    label: string
    date: string
    start: string
    end: string
    global: boolean
}

export interface BlacklistJSON {
    label: string
    date: string
    start: string
    end: string
    global: boolean
    id: string
}
