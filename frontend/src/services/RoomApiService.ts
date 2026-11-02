import { API_URL } from '../config/apiConfig'
import type { CreateRoomRequest } from '../dto/request/CreateRoomRequest'
import type { JoinRoomRequest } from '../dto/request/JoinRoomRequest'
import type { CreateRoomResponse } from '../dto/response/CreateRoomResponse'
import type { JoinRoomResponse } from '../dto/response/JoinRoomResponse'
import type { QuizDto } from '../dto/response/QuizDto'
import type { RoomStateDto } from '../dto/response/RoomStateDto'



// Fetch JSON helper
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
    })

    // Check status
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    return await response.json() as T

}



// Get all quizzes
export const getQuizzes = (): Promise<QuizDto[]> => {
    return request<QuizDto[]>('/api/quizzes')
}



// Create Room
export const createRoom = (body: CreateRoomRequest): Promise<CreateRoomResponse> => {
    return request<CreateRoomResponse>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}



// Join Room
export const joinRoom = (roomCode: string, body: JoinRoomRequest): Promise<JoinRoomResponse> => {
    return request<JoinRoomResponse>(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}



// Get Room State (Snapshot)
export const getRoomState = (roomCode: string): Promise<RoomStateDto> => {
    return request<RoomStateDto>(`/api/rooms/${roomCode}/state`)
}
