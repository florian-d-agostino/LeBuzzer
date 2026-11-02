// Backend base URL
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'



// SockJS endpoint
export const WS_URL: string = `${API_URL}/ws`



// Room topic helper
export const roomTopic = (roomCode: string): string => `/topic/room/${roomCode}`



// App destination helper
export const roomDestination = (roomCode: string, action: string): string => `/app/room/${roomCode}/${action}`



// Reconnect backoff
export const RECONNECT_BASE_DELAY_MS = 1000

export const RECONNECT_MAX_DELAY_MS = 30000
