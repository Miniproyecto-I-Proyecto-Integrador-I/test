import React from 'react'
import type {Subtask} from '../Types/models'
import CardTask from './CardTask'

interface CardsGrid {
    subtasks: Subtask[]
    setSelectedSubtask: (argo0: Subtask) => void
}

const CardsGrid: React.FC<CardsGrid>= ({
    subtasks,
    setSelectedSubtask
}) => {
    return (
        <div className="today-grid">
            {subtasks.map((sub) => (
                <div
                    key={sub.id}
                    className="today-card"
                    onClick={() => setSelectedSubtask(sub)}
                >
                <CardTask sub={sub}/>
                </div>
            ))}
        </div>
    )
}

export default CardsGrid