import { ConnectionStatus } from '../model/ConnectionStatus'
import type { MessageStats } from '../services/SocketService'



interface ConnectionBadgeProps {

    status: ConnectionStatus

    stats: MessageStats

}



// French labels
const LABELS: Record<ConnectionStatus, string> = {
    CONNECTING: 'Connexion…',
    CONNECTED: 'Connecté',
    RECONNECTING: 'Reconnexion…',
    DISCONNECTED: 'Déconnecté',
}



// Connection state pill
export const ConnectionBadge = ({ status, stats }: ConnectionBadgeProps) => {

    return (
        <span
            className={`badge badge-${status.toLowerCase()}`}
            title={`Messages WebSocket : ${stats.sent} envoyés, ${stats.received} reçus`}
        >
            <span className="badge-dot" />
            {LABELS[status]}
        </span>
    )

}
