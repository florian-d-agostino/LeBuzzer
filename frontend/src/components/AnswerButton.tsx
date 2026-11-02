export type AnswerResult = 'correct' | 'wrong' | null



interface AnswerButtonProps {

    index: number

    label: string

    selected?: boolean

    disabled?: boolean

    result?: AnswerResult

    onClick?: () => void

}



// Colored answer option
export const AnswerButton = ({ index, label, selected = false, disabled = false, result = null, onClick }: AnswerButtonProps) => {

    const classes = [
        'answer',
        `answer-${index % 4}`,
        selected && 'answer-selected',
        result && `answer-${result}`,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button className={classes} disabled={disabled} onClick={onClick} aria-pressed={selected}>

            <span className="answer-label">{label}</span>

            {result === 'correct' && <span className="answer-check">✓</span>}

        </button>
    )

}
