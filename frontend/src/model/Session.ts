export interface HostSession {

    role: 'HOST'

    roomCode: string

    hostToken: string

}



export interface PlayerSession {

    role: 'PLAYER'

    roomCode: string

    playerId: number

    playerToken: string

    pseudo: string

}



export type Session = HostSession | PlayerSession
