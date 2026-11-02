import type { Session } from '../model/Session'



const SESSION_KEY = 'lebuzzer.session'

const ANSWERS_KEY = 'lebuzzer.answers'



// Safe storage read
const readJson = <T>(key: string): T | null => {

    try {
        const raw = sessionStorage.getItem(key)
        return raw ? JSON.parse(raw) as T : null
    } catch {
        return null
    }

}



// Safe storage write
const writeJson = (key: string, value: unknown): void => {

    try {
        sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Storage unavailable
    }

}



// Load session
export const loadSession = (): Session | null => {
    return readJson<Session>(SESSION_KEY)
}



// Save session
export const saveSession = (session: Session): void => {
    writeJson(SESSION_KEY, session)
}



// Clear session
export const clearSession = (): void => {

    try {
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(ANSWERS_KEY)
    } catch {
        // Storage unavailable
    }

}



// Answers key helper
const answerKey = (roomCode: string, questionId: number): string => `${roomCode}:${questionId}`



// Load own answer
export const loadAnswer = (roomCode: string, questionId: number): number[] | null => {
    const answers = readJson<Record<string, number[]>>(ANSWERS_KEY) ?? {}
    return answers[answerKey(roomCode, questionId)] ?? null
}



// Save own answer
export const saveAnswer = (roomCode: string, questionId: number, selected: number[]): void => {
    const answers = readJson<Record<string, number[]>>(ANSWERS_KEY) ?? {}
    answers[answerKey(roomCode, questionId)] = selected
    writeJson(ANSWERS_KEY, answers)
}
