import { useState } from 'react'

import { Header } from './components/Header'
import type { Session } from './model/Session'
import { HomePage } from './pages/HomePage'
import { HostPage } from './pages/HostPage'
import { PlayerPage } from './pages/PlayerPage'
import { clearSession, loadSession, saveSession } from './services/SessionService'



// Root component
export const App = () => {


    // Resume after reload
    const [session, setSession] = useState<Session | null>(loadSession)



    // Start session
    const handleSession = (next: Session): void => {
        saveSession(next)
        setSession(next)
    }



    // Leave room
    const handleLeave = (): void => {
        clearSession()
        setSession(null)
    }



    return (
        <div className="app">

            <Header />

            {session === null && <HomePage onSession={handleSession} />}

            {session?.role === 'HOST' && <HostPage key={session.roomCode} session={session} onLeave={handleLeave} />}

            {session?.role === 'PLAYER' && <PlayerPage key={session.roomCode} session={session} onLeave={handleLeave} />}

        </div>
    )

}
