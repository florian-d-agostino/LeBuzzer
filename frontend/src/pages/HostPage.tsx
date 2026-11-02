import { useEffect, useRef } from 'react'

import { AnswerButton } from '../components/AnswerButton'
import { AnswerProgress } from '../components/AnswerProgress'
import { Card } from '../components/Card'
import { Leaderboard } from '../components/Leaderboard'
import { PlayerBar } from '../components/PlayerBar'
import { Podium } from '../components/Podium'
import { QuestionCard } from '../components/QuestionCard'
import { RoomBar } from '../components/RoomBar'
import { useCountdown } from '../hooks/useCountdown'
import { useRoom } from '../hooks/useRoom'
import { ConnectionStatus } from '../model/ConnectionStatus'
import { GameStatus } from '../model/GameStatus'
import type { HostSession } from '../model/Session'



interface HostPageProps {

    session: HostSession

    onLeave: () => void

}



// Host screen
export const HostPage = ({ session, onLeave }: HostPageProps) => {


    const { room, status, stats, error, launchQuestion, closeQuestion, nextQuestion, leaveRoom } = useRoom(session)

    const remaining = useCountdown(room?.deadline ?? null)

    const closedQuestionRef = useRef<number | null>(null)



    // Auto close question
    useEffect(() => {

        if (!room || room.gameStatus !== GameStatus.ACTIVE_QUESTION || !room.currentQuestion) {
            return
        }

        const connectedCount = room.players.filter(p => p.stateCo).length
        const timeIsUp = remaining === 0
        const everyoneAnswered = connectedCount > 0 && room.answeredCount >= connectedCount

        // Close once per question
        if ((timeIsUp || everyoneAnswered) && closedQuestionRef.current !== room.currentQuestion.id) {
            if (closeQuestion()) {
                closedQuestionRef.current = room.currentQuestion.id
            }
        }

    }, [room, remaining, closeQuestion])



    // Leave and end room
    const handleLeave = (): void => {

        const isRunning = room !== null && room.gameStatus !== GameStatus.GAME_OVER && room.gameStatus !== GameStatus.HOST_LEFT

        // Confirm before ending
        if (isRunning && !window.confirm('Quitter terminera la partie pour tous les joueurs. Continuer ?')) {
            return
        }

        if (isRunning) {
            leaveRoom()
        }

        onLeave()

    }



    if (!room) {
        return (
            <main className="page">
                <RoomBar roomCode={session.roomCode} status={status} stats={stats} onLeave={onLeave} />
                <p className="muted">{error ?? 'Chargement…'}</p>
            </main>
        )
    }



    const question = room.currentQuestion
    const isLastQuestion = room.currentQuestionIndex + 1 >= room.totalQuestions
    const offline = status !== ConnectionStatus.CONNECTED



    return (
        <main className="page">

            <RoomBar roomCode={room.roomCode} status={status} stats={stats} onLeave={handleLeave} />

            {error && <p className="alert">{error}</p>}

            <PlayerBar players={room.players} />


            {room.gameStatus === GameStatus.LOBBY && (
                <Card
                    title="Code de la partie"
                    footer={
                        <button className="button button-primary" disabled={offline || room.players.length === 0} onClick={launchQuestion}>
                            Lancer la partie
                        </button>
                    }
                >
                    <p className="room-code">{room.roomCode}</p>
                    <p className="muted">
                        {room.players.length === 0 ? 'En attente de joueurs…' : `${room.players.length} joueur(s) dans la salle`}
                    </p>
                </Card>
            )}


            {room.gameStatus === GameStatus.ACTIVE_QUESTION && question && (
                <QuestionCard
                    index={room.currentQuestionIndex}
                    total={room.totalQuestions}
                    remaining={remaining}
                    question={question.question}
                    footer={
                        <>
                            <AnswerProgress answered={room.answeredCount} total={room.players.length} />
                            <button className="button" disabled={offline} onClick={closeQuestion}>Clore la question</button>
                        </>
                    }
                >
                    {question.options.map((option, index) => (
                        <AnswerButton key={index} index={index} label={option} disabled />
                    ))}
                </QuestionCard>
            )}


            {room.gameStatus === GameStatus.RESULT_QUESTION && question && (
                <>
                    <QuestionCard
                        index={room.currentQuestionIndex}
                        total={room.totalQuestions}
                        remaining={0}
                        question={question.question}
                    >
                        {question.options.map((option, index) => (
                            <AnswerButton
                                key={index}
                                index={index}
                                label={option}
                                disabled
                                result={room.correctAnswers?.includes(index) ? 'correct' : room.correctAnswers ? 'wrong' : null}
                            />
                        ))}
                    </QuestionCard>

                    <button className="button button-floating" disabled={offline} onClick={nextQuestion}>
                        {isLastQuestion ? 'Classement final' : 'Suivant'}
                    </button>

                    <Card title="Classement">
                        <Leaderboard leaderboard={room.leaderboard} />
                    </Card>
                </>
            )}


            {room.gameStatus === GameStatus.HOST_LEFT && (
                <Card
                    title="Partie terminée"
                    footer={<button className="button button-primary" onClick={onLeave}>Retour au menu</button>}
                >
                    <p className="muted">Tu as été absent plus de 10 secondes, la partie a été fermée.</p>
                </Card>
            )}


            {room.gameStatus === GameStatus.GAME_OVER && (
                <Card
                    title="Classement"
                    footer={<button className="button" onClick={onLeave}>Fermer</button>}
                >
                    <Podium leaderboard={room.leaderboard} />
                </Card>
            )}

        </main>
    )

}
