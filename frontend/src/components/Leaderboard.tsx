import type { PlayerDto } from '../dto/response/PlayerDto'



interface LeaderboardProps {

    leaderboard: PlayerDto[]

    selfId?: number

}



// Ranked players list
export const Leaderboard = ({ leaderboard, selfId }: LeaderboardProps) => {

    if (leaderboard.length === 0) {
        return <p className="muted">Aucun joueur</p>
    }

    return (
        <ol className="leaderboard">

            {leaderboard.map((player, rank) => (
                <li key={player.id} className={player.id === selfId ? 'leaderboard-self' : undefined}>
                    <span className="leaderboard-rank">{rank + 1}</span>
                    <span className="leaderboard-name">{player.pseudo}</span>
                    <span className="leaderboard-score">{player.score} pts</span>
                </li>
            ))}

        </ol>
    )

}
