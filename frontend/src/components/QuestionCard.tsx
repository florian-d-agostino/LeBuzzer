import type { ReactNode } from 'react'



interface QuestionCardProps {

    index: number

    total: number

    remaining: number | null

    question: string

    children: ReactNode

    footer?: ReactNode

}



// Question layout card
export const QuestionCard = ({ index, total, remaining, question, children, footer }: QuestionCardProps) => {

    return (
        <section className="card">

            <div className="question-head">
                <span>Question</span>
                <span className="question-timer">{remaining === null ? '' : `${remaining}s`}</span>
                <span>{index + 1}/{total}</span>
            </div>

            <p className="question-text">{question}</p>

            <div className="answers">{children}</div>

            {footer && <div className="card-footer">{footer}</div>}

        </section>
    )

}
