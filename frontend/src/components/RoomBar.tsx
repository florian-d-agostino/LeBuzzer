import type { ConnectionStatus } from '../model/ConnectionStatus'
import type { MessageStats } from '../services/SocketService'
import { ConnectionBadge } from './ConnectionBadge'



interface RoomBarProps {

    roomCode: string

    status: ConnectionStatus

    stats: MessageStats

    onLeave: () => void

}



// Room info row
export const RoomBar = ({ roomCode, status, stats, onLeave }: RoomBarProps) => {

    return (
        <div className="room-bar">

            <span className="room-bar-code">Partie <strong>{roomCode}</strong></span>

            <ConnectionBadge status={status} stats={stats} />

            <button className="link-button" onClick={onLeave}>Quitter</button>

        </div>
    )

}
