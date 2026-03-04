import React from 'react'
import type {Subtask} from '../Types/models'

interface CardTask {
    sub: Subtask
}

const CardTask: React.FC<CardTask> = ({
    sub
}) => {
    return (
        <div>
            <div className="card-top">
                {sub.task && (
                    <span className="parent-badge">{sub.task.title}</span>
                )}
                <span className={`status-dot ${sub.status}`}></span>
            </div>

            <h4 className="card-title">{sub.description}</h4>

            <div className="card-bottom">
                <span className="time-badge">⏱ {sub.needed_hours} hrs</span>
                <span className="time-badge">
                    Para {new Date(sub.planification_date).toLocaleDateString()}
                </span>
                <span className="view-more">Ver detalles ➔</span>
            </div>
        </div>
    )
}

export default CardTask