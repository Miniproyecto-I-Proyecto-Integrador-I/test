import { useNavigate } from 'react-router-dom';

const EmptyState: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="today-empty-state">
            <div className="empty-content">
                <h2>No hay resultados</h2>
                <p>No se encontraron tareas con los filtros aplicados.</p>
                <button className="btn-primary" onClick={() => navigate('/create')}>
                    Crear actividad
                </button>
            </div>
        </div>
    )
}

export default EmptyState