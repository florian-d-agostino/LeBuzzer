import type { GameStatus } from './GameStatus'
import type { PlayerDto } from '../dto/response/PlayerDto'
import type { QuestionDto } from '../dto/response/QuestionDto'



// Client side room state
export interface RoomState {

    roomCode: string

    gameStatus: GameStatus

    currentQuestionIndex: number

    totalQuestions: number

    currentQuestion: QuestionDto | null

    // Local end timestamp
    deadline: number | null

    players: PlayerDto[]

    answeredCount: number

    correctAnswers: number[] | null

    leaderboard: PlayerDto[]

    hostConnected: boolean

}
