import type { PlayerDto } from '../dto/response/PlayerDto'
import { PlayerTile } from './PlayerTile'



interface PodiumProps {

    leaderboard: PlayerDto[]

    selfId?: number

}



// Display order 2-1-3
const PODIUM_ORDER = [1, 0, 2]



// Top three podium
export const Podium = ({ leaderboard, selfId }: PodiumProps) => {

    return (
        <div className="podium">

            {PODIUM_ORDER.map(rank => {

                const player = leaderboard[rank]

                if (!player) {
                    return <div key={rank} className="podium-step" />
                }

                return (
                    <div key={rank} className={`podium-step podium-${rank + 1}`}>
                        <PlayerTile label={player.pseudo} size="large" highlight={player.id === selfId} />
                        <span className="podium-score">{player.score} pts</span>
                    </div>
                )

            })}

        </div>
    )

}
