import { useEffect, useState } from 'react'

import { AnswerButton } from '../components/AnswerButton'
import type { AnswerResult } from '../components/AnswerButton'
import { Card } from '../components/Card'
import { Leaderboard } from '../components/Leaderboard'
import { PlayerBar } from '../components/PlayerBar'
import { Podium } from '../components/Podium'
import { QuestionCard } from '../components/QuestionCard'
import { RoomBar } from '../components/RoomBar'
import { useCountdown } from '../hooks/useCountdown'
import { useRoom } from '../hooks/useRoom'
import { GameStatus } from '../model/GameStatus'
import type { PlayerSession } from '../model/Session'
import { isSameAnswer, rankLabel } from '../services/AnswerService'
import { loadAnswer, saveAnswer } from '../services/SessionService'



interface PlayerPageProps {

    session: PlayerSession

    onLeave: () => void

}



// Player screen
export const PlayerPage = ({ session, onLeave }: PlayerPageProps) => {


    const { room, status, stats, error, submitAnswer } = useRoom(session)

    const remaining = useCountdown(room?.deadline ?? null)

    const [selected, setSelected] = useState<number[]>([])

    const [submitted, setSubmitted] = useState<number[] | null>(null)

    const [sendError, setSendError] = useState<string | null>(null)

    const questionId = room?.currentQuestion?.id ?? null



    // Restore own answer
    useEffect(() => {

        const saved = questionId === null ? null : loadAnswer(session.roomCode, questionId)
        setSubmitted(saved)
        setSelected(saved ?? [])
        setSendError(null)

    }, [session.roomCode, questionId])



    if (!room) {
        return (
            <main className="page">
                <RoomBar roomCode={session.roomCode} status={status} stats={stats} onLeave={onLeave} />
                <p className="muted">{error ?? 'Chargement…'}</p>
            </main>
        )
    }



    const question = room.currentQuestion
    const timeIsUp = remaining === 0
    const canAnswer = room.gameStatus === GameStatus.ACTIVE_QUESTION && submitted === null && !timeIsUp
    const rank = room.leaderboard.findIndex(p => p.id === session.playerId) + 1
    const me = room.leaderboard.find(p => p.id === session.playerId)



    // Toggle option
    const toggle = (index: number): void => {
        setSelected(current => current.includes(index) ? current.filter(i => i !== index) : [...current, index])
    }



    // Send answer once
    const handleSubmit = (): void => {

        if (!question || !canAnswer || selected.length === 0) {
            return
        }

        if (!submitAnswer(selected)) {
            setSendError('Hors ligne, réessaie dans un instant')
            return
        }

        saveAnswer(session.roomCode, question.id, selected)
        setSubmitted(selected)

    }



    // Option result helper
    const resultFor = (index: number): AnswerResult => {

        if (!room.correctAnswers) {
            return null
        }

        if (room.correctAnswers.includes(index)) {
            return 'correct'
        }

        return 'wrong'

    }



    return (
        <main className="page">

            <RoomBar roomCode={room.roomCode} status={status} stats={stats} onLeave={onLeave} />

            {error && <p className="alert">{error}</p>}

            <PlayerBar players={room.players} selfId={session.playerId} hostConnected={room.hostConnected} />


            {!room.hostConnected && room.gameStatus !== GameStatus.HOST_LEFT && room.gameStatus !== GameStatus.GAME_OVER && (
                <p className="alert">L'hôte s'est déconnecté, en attente de son retour…</p>
            )}


            {room.gameStatus === GameStatus.HOST_LEFT && (
                <Card
                    title="L'hôte a quitté la partie"
                    footer={<button className="button button-primary" onClick={onLeave}>Retour au menu</button>}
                >
                    <p className="muted">La partie est terminée.</p>
                </Card>
            )}


            {room.gameStatus === GameStatus.LOBBY && (
                <Card title={`Salut ${session.pseudo} !`}>
                    <p className="muted">En attente du lancement par l'animateur…</p>
                </Card>
            )}


            {room.gameStatus === GameStatus.ACTIVE_QUESTION && question && (
                <QuestionCard
                    index={room.currentQuestionIndex}
                    total={room.totalQuestions}
                    remaining={remaining}
                    question={question.question}
                    footer={
                        submitted !== null
                            ? <p className="muted">Réponse envoyée, en attente des autres…</p>
                            : timeIsUp
                                ? <p className="muted">Temps écoulé</p>
                                : (
                                    <>
                                        {sendError && <p className="alert">{sendError}</p>}
                                        <button className="button button-primary" disabled={selected.length === 0} onClick={handleSubmit}>
                                            Valider
                                        </button>
                                    </>
                                )
                    }
                >
                    <p className="hint">Plusieurs réponses possibles</p>
                    {question.options.map((option, index) => (
                        <AnswerButton
                            key={index}
                            index={index}
                            label={option}
                            selected={selected.includes(index)}
                            disabled={!canAnswer}
                            onClick={() => toggle(index)}
                        />
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
                        footer={
                            room.correctAnswers && (
                                <p className={`result ${submitted && isSameAnswer(submitted, room.correctAnswers) ? 'result-win' : 'result-lose'}`}>
                                    {submitted === null
                                        ? 'Pas de réponse'
                                        : isSameAnswer(submitted, room.correctAnswers) ? 'Bonne réponse ! +10' : 'Raté…'}
                                </p>
                            )
                        }
                    >
                        {question.options.map((option, index) => (
                            <AnswerButton
                                key={index}
                                index={index}
                                label={option}
                                selected={submitted?.includes(index) ?? false}
                                disabled
                                result={resultFor(index)}
                            />
                        ))}
                    </QuestionCard>

                    <Card title={rank > 0 ? `Tu es ${rankLabel(rank)} sur ${room.leaderboard.length}` : 'Classement'}>
                        <Leaderboard leaderboard={room.leaderboard} selfId={session.playerId} />
                    </Card>
                </>
            )}


            {room.gameStatus === GameStatus.GAME_OVER && (
                <Card
                    title="Classement"
                    footer={<button className="button" onClick={onLeave}>Fermer</button>}
                >
                    <Podium leaderboard={room.leaderboard} selfId={session.playerId} />
                    {me && <p className="muted center">Tu finis {rankLabel(rank)} avec {me.score} pts</p>}
                </Card>
            )}

        </main>
    )

}
