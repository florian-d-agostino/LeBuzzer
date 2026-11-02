import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Card } from '../components/Card'
import type { QuizDto } from '../dto/response/QuizDto'
import type { Session } from '../model/Session'
import { createRoom, getQuizzes, joinRoom } from '../services/RoomApiService'



interface HomePageProps {

    onSession: (session: Session) => void

}



const CODE_LENGTH = 5

const PSEUDO_MAX_LENGTH = 12



// Join or create screen
export const HomePage = ({ onSession }: HomePageProps) => {


    const [roomCode, setRoomCode] = useState('')

    const [pseudo, setPseudo] = useState('')

    const [quizzes, setQuizzes] = useState<QuizDto[]>([])

    const [quizId, setQuizId] = useState('')

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState<string | null>(null)



    // Load quizzes
    useEffect(() => {

        let cancelled = false

        getQuizzes()
            .then(list => {
                if (cancelled) return
                setQuizzes(list)
                setQuizId(list[0]?.id ?? '')
            })
            .catch(() => {
                if (!cancelled) setError('Serveur injoignable')
            })

        // Ignore late response
        return () => { cancelled = true }

    }, [])



    // Join as player
    const handleJoin = async (event: FormEvent): Promise<void> => {

        event.preventDefault()
        setError(null)

        const code = roomCode.trim().toUpperCase()
        const name = pseudo.trim()

        // Check form
        if (code.length !== CODE_LENGTH || name.length === 0) {
            setError('Code à 5 caractères et pseudo requis')
            return
        }

        setLoading(true)
        try {
            const response = await joinRoom(code, { pseudo: name })
            onSession({ role: 'PLAYER', roomCode: code, ...response })
        } catch {
            setError('Code invalide ou pseudo déjà pris')
        } finally {
            setLoading(false)
        }

    }



    // Create as host
    const handleCreate = async (event: FormEvent): Promise<void> => {

        event.preventDefault()
        setError(null)

        setLoading(true)
        try {
            const response = await createRoom({ quizId })
            onSession({ role: 'HOST', ...response })
        } catch {
            setError('Impossible de créer la partie')
        } finally {
            setLoading(false)
        }

    }



    return (
        <main className="page">

            {error && <p className="alert">{error}</p>}


            <Card title="Rejoindre une partie">
                <form className="form" onSubmit={handleJoin}>

                    <input
                        className="input input-code"
                        placeholder="CODE"
                        value={roomCode}
                        maxLength={CODE_LENGTH}
                        autoCapitalize="characters"
                        autoComplete="off"
                        onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    />

                    <input
                        className="input"
                        placeholder="Pseudo"
                        value={pseudo}
                        maxLength={PSEUDO_MAX_LENGTH}
                        onChange={e => setPseudo(e.target.value)}
                    />

                    <button className="button button-primary" disabled={loading}>Rejoindre</button>

                </form>
            </Card>


            <Card title="Animer une partie">
                <form className="form" onSubmit={handleCreate}>

                    <select className="input" value={quizId} onChange={e => setQuizId(e.target.value)}>
                        {quizzes.map(quiz => (
                            <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                        ))}
                    </select>

                    <button className="button" disabled={loading || !quizId}>Créer la partie</button>

                </form>
            </Card>

        </main>
    )

}
