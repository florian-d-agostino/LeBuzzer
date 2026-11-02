import type { GameStatus } from '../../model/GameStatus'
import type { PlayerDto } from './PlayerDto'
import type { QuestionDto } from './QuestionDto'



export interface RoomStateDto {

    roomCode: string

    gameStatus: GameStatus

    currentQuestionIndex: number

    totalQuestions: number

    currentQuestion: QuestionDto | null

    players: PlayerDto[]

    hostConnected: boolean

}
