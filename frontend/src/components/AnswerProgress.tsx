interface AnswerProgressProps {

    answered: number

    total: number

}



// Answers count bar
export const AnswerProgress = ({ answered, total }: AnswerProgressProps) => {

    const count = Math.min(answered, total)
    const percent = total === 0 ? 0 : Math.round((count / total) * 100)

    return (
        <div className="progress">

            <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>

            <span className="progress-label">{count} / {total} réponses</span>

        </div>
    )

}
