export interface Room {
  readonly label: string
  readonly description: string
  readonly capacity: number
  readonly id: string
}

export interface RoomProtocol {
  label: string
  description: string
  capacity: number
}
