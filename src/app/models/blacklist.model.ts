export interface Blacklist {
    label: string
    date: Date
    start: Date
    end: Date
    global: boolean
    id: string
}

export interface BlacklistProtocol {
    label: string
    date: string
    start?: string
    end?: string
    global: boolean
}
