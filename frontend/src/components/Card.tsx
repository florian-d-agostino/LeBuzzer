import type { ReactNode } from 'react'



interface CardProps {

    title?: string

    children: ReactNode

    footer?: ReactNode

}



// Dark card container
export const Card = ({ title, children, footer }: CardProps) => {

    return (
        <section className="card">

            {title && <h2 className="card-title">{title}</h2>}

            {children}

            {footer && <div className="card-footer">{footer}</div>}

        </section>
    )

}
