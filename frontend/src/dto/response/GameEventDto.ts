import { GameEventType } from '../../model/GameEventType'
import type { PlayerDto } from './PlayerDto'
import type { QuestionDto } from './QuestionDto'



// Typed room events
export type GameEventDto =
    | { type: typeof GameEventType.PLAYER_JOINED, payload: PlayerDto }
    | { type: typeof GameEventType.PLAYER_RECONNECTED, payload: PlayerDto }
    | { type: typeof GameEventType.PLAYER_DISCONNECTED, payload: PlayerDto }
    | { type: typeof GameEventType.QUESTION_STARTED, payload: QuestionDto }
    | { type: typeof GameEventType.ANSWER_SUBMITTED, payload: { isCorrect: boolean, roomCode: string } }
    | { type: typeof GameEventType.QUESTION_CLOSED, payload: { correctAnswers: number[], leaderboard: PlayerDto[] } }
    | { type: typeof GameEventType.GAME_OVER, payload: PlayerDto[] }
    | { type: typeof GameEventType.HOST_DISCONNECTED, payload: Record<string, never> }
    | { type: typeof GameEventType.HOST_RECONNECTED, payload: Record<string, never> }
    | { type: typeof GameEventType.HOST_LEFT, payload: Record<string, never> }



// Known event types
const EVENT_TYPES: readonly string[] = Object.values(GameEventType)



// Check incoming event
export const isGameEvent = (data: unknown): data is GameEventDto => {

    if (typeof data !== 'object' || data === null) {
        return false
    }

    const type: unknown = (data as { type?: unknown }).type

    return typeof type === 'string' && EVENT_TYPES.includes(type) && 'payload' in data

}
