import { useEffect, useState } from 'react'

import { ConnectionStatus } from '../model/ConnectionStatus'
import { SocketService } from '../services/SocketService'



export interface UseSocketResult {

    socket: SocketService

    status: ConnectionStatus

}



// Socket lifecycle hook
export const useSocket = (): UseSocketResult => {


    // One service per mount
    const [socket] = useState(() => new SocketService())

    const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING)



    // Connect on mount
    useEffect(() => {

        const stopListening = socket.onStatus(setStatus)
        socket.connect()

        // Cleanup on unmount
        return () => {
            stopListening()
            socket.disconnect()
        }

    }, [socket])



    return { socket, status }

}
