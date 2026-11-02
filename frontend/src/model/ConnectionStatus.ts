export const ConnectionStatus = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    RECONNECTING: 'RECONNECTING',
    DISCONNECTED: 'DISCONNECTED',
} as const



export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus]
