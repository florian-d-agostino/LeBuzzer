import type { GameEventDto } from '../dto/response/GameEventDto'
import type { PlayerDto } from '../dto/response/PlayerDto'
import type { RoomStateDto } from '../dto/response/RoomStateDto'
import { GameEventType } from '../model/GameEventType'
import { GameStatus } from '../model/GameStatus'
import type { RoomState } from '../model/RoomState'



export type RoomAction =
    | { kind: 'SNAPSHOT', snapshot: RoomStateDto, receivedAt: number }
    | { kind: 'EVENT', event: GameEventDto, receivedAt: number }



// Sort by score helper
const sortByScore = (players: PlayerDto[]): PlayerDto[] => {
    return [...players].sort((a, b) => b.score - a.score)
}



// Upsert player helper
const upsertPlayer = (players: PlayerDto[], player: PlayerDto): PlayerDto[] => {

    const exists = players.some(p => p.id === player.id)

    return exists
        ? players.map(p => (p.id === player.id ? player : p))
        : [...players, player]

}



// Apply snapshot
const applySnapshot = (previous: RoomState | null, snapshot: RoomStateDto, receivedAt: number): RoomState => {

    const isActive = snapshot.gameStatus === GameStatus.ACTIVE_QUESTION
    const question = snapshot.gameStatus === GameStatus.LOBBY ? null : snapshot.currentQuestion

    // Same question as before
    const sameQuestion = previous?.currentQuestion != null && previous.currentQuestion.id === question?.id

    return {
        roomCode: snapshot.roomCode,
        gameStatus: snapshot.gameStatus,
        currentQuestionIndex: snapshot.currentQuestionIndex,
        totalQuestions: snapshot.totalQuestions,
        currentQuestion: question,
        deadline: isActive && question ? receivedAt + question.remainingSeconds * 1000 : null,
        players: snapshot.players,
        answeredCount: sameQuestion && previous ? previous.answeredCount : 0,
        correctAnswers: sameQuestion && previous ? previous.correctAnswers : null,
        leaderboard: sortByScore(snapshot.players),
        hostConnected: snapshot.hostConnected,
    }

}



// Apply event
const applyEvent = (state: RoomState, event: GameEventDto, receivedAt: number): RoomState => {

    switch (event.type) {


        // Player joined, back or gone
        case GameEventType.PLAYER_JOINED:
        case GameEventType.PLAYER_RECONNECTED:
        case GameEventType.PLAYER_DISCONNECTED: {
            const players = upsertPlayer(state.players, event.payload)
            return { ...state, players, leaderboard: sortByScore(players) }
        }


        // New question
        case GameEventType.QUESTION_STARTED:
            return {
                ...state,
                gameStatus: GameStatus.ACTIVE_QUESTION,
                currentQuestionIndex: state.gameStatus === GameStatus.LOBBY
                    ? state.currentQuestionIndex
                    : state.currentQuestionIndex + 1,
                currentQuestion: event.payload,
                deadline: receivedAt + event.payload.remainingSeconds * 1000,
                answeredCount: 0,
                correctAnswers: null,
            }


        // Answer progress
        case GameEventType.ANSWER_SUBMITTED:
            return { ...state, answeredCount: state.answeredCount + 1 }


        // Results
        case GameEventType.QUESTION_CLOSED: {
            const scores = new Map(event.payload.leaderboard.map(p => [p.id, p]))
            return {
                ...state,
                gameStatus: GameStatus.RESULT_QUESTION,
                deadline: null,
                correctAnswers: event.payload.correctAnswers,
                leaderboard: event.payload.leaderboard,
                players: state.players.map(p => scores.get(p.id) ?? p),
            }
        }


        // End of game
        case GameEventType.GAME_OVER:
            return {
                ...state,
                gameStatus: GameStatus.GAME_OVER,
                deadline: null,
                leaderboard: event.payload,
            }


        // Host presence
        case GameEventType.HOST_DISCONNECTED:
            return { ...state, hostConnected: false }

        case GameEventType.HOST_RECONNECTED:
            return { ...state, hostConnected: true }


        // Host gone for good
        case GameEventType.HOST_LEFT:
            return { ...state, gameStatus: GameStatus.HOST_LEFT, hostConnected: false, deadline: null }

    }

}



// Room reducer
export const roomReducer = (state: RoomState | null, action: RoomAction): RoomState | null => {

    if (action.kind === 'SNAPSHOT') {
        return applySnapshot(state, action.snapshot, action.receivedAt)
    }

    // Wait first snapshot
    return state ? applyEvent(state, action.event, action.receivedAt) : state

}
