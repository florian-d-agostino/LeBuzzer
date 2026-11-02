import type { PlayerDto } from '../dto/response/PlayerDto'
import { PlayerTile } from './PlayerTile'



interface PlayerBarProps {

    players: PlayerDto[]

    selfId?: number

}



// Horizontal players list
export const PlayerBar = ({ players, selfId }: PlayerBarProps) => {

    return (
        <div className="player-bar">

            <PlayerTile label="Host" crown />

            {players.map(player => (
                <PlayerTile
                    key={player.id}
                    label={player.pseudo}
                    offline={!player.stateCo}
                    highlight={player.id === selfId}
                />
            ))}

        </div>
    )

}
