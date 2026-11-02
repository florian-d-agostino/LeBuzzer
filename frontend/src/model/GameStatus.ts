export const GameStatus = {
    LOBBY: 'LOBBY',
    ACTIVE_QUESTION: 'ACTIVE_QUESTION',
    RESULT_QUESTION: 'RESULT_QUESTION',
    GAME_OVER: 'GAME_OVER',
} as const



export type GameStatus = typeof GameStatus[keyof typeof GameStatus]
