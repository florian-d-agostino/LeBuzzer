import { Client } from '@stomp/stompjs'
import type { IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import { RECONNECT_BASE_DELAY_MS, RECONNECT_MAX_DELAY_MS, WS_URL } from '../config/apiConfig'
import { ConnectionStatus } from '../model/ConnectionStatus'



type MessageHandler = (body: unknown) => void

type StatusListener = (status: ConnectionStatus) => void

type ConnectListener = () => void



export interface MessageStats {

    sent: number

    received: number

}



// STOMP transport with backoff
export class SocketService {


    private client: Client | null = null

    private attempt = 0

    private retryTimer: ReturnType<typeof setTimeout> | null = null

    private stopped = true

    private status: ConnectionStatus = ConnectionStatus.DISCONNECTED

    private readonly handlers = new Map<string, Set<MessageHandler>>()

    private readonly stompSubscriptions = new Map<string, StompSubscription>()

    private readonly statusListeners = new Set<StatusListener>()

    private readonly connectListeners = new Set<ConnectListener>()

    readonly stats: MessageStats = { sent: 0, received: 0 }



    // Status change helper
    private setStatus(status: ConnectionStatus): void {
        this.status = status
        this.statusListeners.forEach(listener => listener(status))
    }



    // Exponential delay helper
    private nextDelay(): number {
        const exponential = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** this.attempt, RECONNECT_MAX_DELAY_MS)
        const jitter = Math.random() * 0.3 * exponential
        return Math.round(exponential + jitter)
    }



    // Dispatch message helper
    private dispatch(destination: string, message: IMessage): void {

        this.stats.received++

        // Parse body
        let body: unknown
        try {
            body = JSON.parse(message.body)
        } catch {
            return
        }

        this.handlers.get(destination)?.forEach(handler => handler(body))

    }



    // Broker subscribe helper
    private subscribeOnBroker(destination: string): void {

        if (!this.client?.connected || this.stompSubscriptions.has(destination)) {
            return
        }

        const subscription = this.client.subscribe(destination, message => this.dispatch(destination, message))
        this.stompSubscriptions.set(destination, subscription)

    }



    // Open one connection
    private open(): void {

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 0,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        })


        // Connected
        client.onConnect = () => {

            // Ignore stale client
            if (this.client !== client) {
                void client.deactivate()
                return
            }

            this.attempt = 0
            this.stompSubscriptions.clear()
            this.setStatus(ConnectionStatus.CONNECTED)

            // Resubscribe all topics
            this.handlers.forEach((_, destination) => this.subscribeOnBroker(destination))

            // Catch up state
            this.connectListeners.forEach(listener => listener())

        }


        // Connection lost
        client.onWebSocketClose = () => {

            if (this.client !== client) {
                return
            }

            this.client = null
            this.stompSubscriptions.clear()
            void client.deactivate()

            this.scheduleReconnect()

        }


        // Broker error
        client.onStompError = () => {
            client.forceDisconnect()
        }


        this.client = client
        client.activate()

    }



    // Schedule retry
    private scheduleReconnect(): void {

        if (this.stopped || this.retryTimer) {
            return
        }

        const delay = this.nextDelay()
        this.attempt++
        this.setStatus(ConnectionStatus.RECONNECTING)

        this.retryTimer = setTimeout(() => {
            this.retryTimer = null
            this.open()
        }, delay)

    }



    // Browser offline
    private readonly handleOffline = (): void => {
        this.client?.forceDisconnect()
        this.setStatus(ConnectionStatus.DISCONNECTED)
    }



    // Browser online
    private readonly handleOnline = (): void => {

        if (this.stopped || this.client?.connected) {
            return
        }

        // Retry immediately
        if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
        }
        const pending = this.client
        this.client = null
        void pending?.deactivate()

        this.attempt = 0
        this.open()

    }



    // Start connection
    connect(): void {

        if (!this.stopped) {
            return
        }

        this.stopped = false
        this.setStatus(ConnectionStatus.CONNECTING)

        window.addEventListener('offline', this.handleOffline)
        window.addEventListener('online', this.handleOnline)

        this.open()

    }



    // Stop connection
    disconnect(): void {

        this.stopped = true

        window.removeEventListener('offline', this.handleOffline)
        window.removeEventListener('online', this.handleOnline)

        if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
        }

        const client = this.client
        this.client = null
        this.stompSubscriptions.clear()
        void client?.deactivate()

        this.setStatus(ConnectionStatus.DISCONNECTED)

    }



    // Subscribe to topic
    subscribe(destination: string, handler: MessageHandler): () => void {

        const handlers = this.handlers.get(destination) ?? new Set<MessageHandler>()
        handlers.add(handler)
        this.handlers.set(destination, handlers)

        this.subscribeOnBroker(destination)

        // Unsubscribe
        return () => {

            handlers.delete(handler)

            if (handlers.size === 0) {
                this.handlers.delete(destination)
                this.stompSubscriptions.get(destination)?.unsubscribe()
                this.stompSubscriptions.delete(destination)
            }

        }

    }



    // Publish message
    publish(destination: string, body: unknown = {}, headers: Record<string, string> = {}): boolean {

        if (!this.client?.connected) {
            return false
        }

        this.client.publish({ destination, body: JSON.stringify(body), headers })
        this.stats.sent++

        return true

    }



    // Listen status
    onStatus(listener: StatusListener): () => void {
        this.statusListeners.add(listener)
        listener(this.status)
        return () => { this.statusListeners.delete(listener) }
    }



    // Listen connect
    onConnect(listener: ConnectListener): () => void {
        this.connectListeners.add(listener)
        return () => { this.connectListeners.delete(listener) }
    }

}
