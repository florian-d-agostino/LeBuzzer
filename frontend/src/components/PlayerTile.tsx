interface PlayerTileProps {

    label: string

    crown?: boolean

    offline?: boolean

    highlight?: boolean

    size?: 'small' | 'large'

}



// Player avatar tile
export const PlayerTile = ({ label, crown = false, offline = false, highlight = false, size = 'small' }: PlayerTileProps) => {

    const classes = ['tile', `tile-${size}`, offline && 'tile-offline', highlight && 'tile-highlight']
        .filter(Boolean)
        .join(' ')

    return (
        <div className={classes}>

            {crown && <span className="tile-crown" aria-label="Animateur">👑</span>}

            <div className="tile-avatar">{label.charAt(0).toUpperCase()}</div>

            <span className="tile-label">{label}</span>

        </div>
    )

}
