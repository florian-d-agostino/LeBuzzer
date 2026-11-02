import { useCallback, useEffect, useReducer, useState } from 'react'

import { roomDestination, roomTopic } from '../config/apiConfig'
import type { ReconnectRequest } from '../dto/request/ReconnectRequest'
import type { SubmitAnswerRequest } from '../dto/request/SubmitAnswerRequest'
import { isGameEvent } from '../dto/response/GameEventDto'
import { GameEventType } from '../model/GameEventType'
import type { ConnectionStatus } from '../model/ConnectionStatus'
import type { RoomState } from '../model/RoomState'
import type { Session } from '../model/Session'
import { getRoomState } from '../services/RoomApiService'
import { roomReducer } from '../services/roomReducer'
import type { MessageStats } from '../services/SocketService'
import { useSocket } from './useSocket'



export interface UseRoomResult {

    room: RoomState | null

    status: ConnectionStatus

    stats: MessageStats

    error: string | null

    launchQuestion: () => boolean

    closeQuestion: () => boolean

    nextQuestion: () => boolean

    submitAnswer: (selectedAnswers: number[]) => boolean

}



// Room state hook
export const useRoom = (session: Session): UseRoomResult => {


    const { socket, status } = useSocket()

    const [room, dispatch] = useReducer(roomReducer, null)

    const [error, setError] = useState<string | null>(null)

    const { roomCode } = session



    // Fetch snapshot helper
    const loadSnapshot = useCallback(async (): Promise<void> => {

        try {
            const snapshot = await getRoomState(roomCode)
            dispatch({ kind: 'SNAPSHOT', snapshot, receivedAt: Date.now() })
            setError(null)
        } catch {
            setError('Partie introuvable')
        }

    }, [roomCode])



    // Subscribe room topic
    useEffect(() => {

        const unsubscribe = socket.subscribe(roomTopic(roomCode), body => {

            if (!isGameEvent(body)) {
                return
            }

            dispatch({ kind: 'EVENT', event: body, receivedAt: Date.now() })

            // Refresh connected list
            if (body.type === GameEventType.PLAYER_DISCONNECTED) {
                void loadSnapshot()
            }

        })

        // Unsubscribe on unmount
        return unsubscribe

    }, [socket, roomCode, loadSnapshot])



    // Catch up on (re)connect
    useEffect(() => {

        const playerToken = session.role === 'PLAYER' ? session.playerToken : null

        return socket.onConnect(() => {

            // Mark player online
            if (playerToken) {
                const body: ReconnectRequest = { playerToken }
                socket.publish(roomDestination(roomCode, 'reconnect'), body)
            }

            void loadSnapshot()

        })

    }, [socket, roomCode, session, loadSnapshot])



    // Host command helper
    const sendHostCommand = useCallback((action: string): boolean => {

        if (session.role !== 'HOST') {
            return false
        }

        return socket.publish(roomDestination(roomCode, action), {}, { hostToken: session.hostToken })

    }, [socket, roomCode, session])



    // Submit Answer
    const submitAnswer = useCallback((selectedAnswers: number[]): boolean => {

        if (session.role !== 'PLAYER') {
            return false
        }

        const body: SubmitAnswerRequest = { playerToken: session.playerToken, selectedAnswers }

        return socket.publish(roomDestination(roomCode, 'submit'), body)

    }, [socket, roomCode, session])



    return {
        room,
        status,
        stats: socket.stats,
        error,
        launchQuestion: () => sendHostCommand('launch'),
        closeQuestion: () => sendHostCommand('close'),
        nextQuestion: () => sendHostCommand('next'),
        submitAnswer,
    }

}
