import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { todayService } from '../Feature/ManageTodayPage/Services/todayService';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';
import './TodayPage.css';

const TodayPage: React.FC = () => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await todayService.getTodaySubtasks();
                console.log("DATA:", data);
                setSubtasks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    if (loading) {
        return (
            <div className="today-loading-state">
                <div className="spinner"></div>
                <p>Cargando tus tareas de hoy...</p>
            </div>
        );
    }

    if (subtasks.length === 0) {
        return (
            <div className="today-empty-state">
                <div className="empty-content">
                    <span className="empty-icon">☕</span>
                    <h2>Día libre o todo completado</h2>
                    <p>No tienes tareas planificadas para el día de hoy.</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/create')}
                    >
                        Crear actividad
                    </button>
                </div>
            </div>
        );
    }

    const now = new Date();
    const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    const fecha = colombia.toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="today-page">
            <header className="today-header">
                <h1 className="today-title">Mi Día</h1>
                <p className="today-date">{fecha.charAt(0).toUpperCase() + fecha.slice(1)}</p>
            </header>

            <div className="today-grid">
                {subtasks.map(sub => (
                    <div
                        key={sub.id}
                        className="today-card"
                        onClick={() => setSelectedSubtask(sub)}
                    >
                        <div className="card-top">
                            {sub.task && (
                                <span className="parent-badge">
                                    {sub.task.title}
                                </span>
                            )}
                            <span className={`status-dot ${sub.status}`}></span>
                        </div>

                        <h4 className="card-title">{sub.description}</h4>

                        <div className="card-bottom">
                            <span className="time-badge">⏱ {sub.needed_hours} hrs</span>
                            <span className="view-more">Ver detalles ➔</span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedSubtask && (
                <div className="modal-overlay" onClick={() => setSelectedSubtask(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedSubtask(null)}>×</button>

                        <div className="modal-header">
                            <h2>{selectedSubtask.description}</h2>
                            <div className="modal-tags">
                                <span className="tag status-tag">Estado: {selectedSubtask.status}</span>
                                <span className="tag time-tag">Horas necesarias: {selectedSubtask.needed_hours}</span>
                            </div>
                        </div>

                        {selectedSubtask.task && (
                            <div className="parent-task-info">
                                <h3>Información de la Tarea Principal</h3>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <strong>Título:</strong>
                                        <span>{selectedSubtask.task.title}</span>
                                    </div>
                                    <div className="info-item">
                                        <strong>Estado:</strong>
                                        <span>{selectedSubtask.task.status}</span>
                                    </div>
                                    {selectedSubtask.task.priority && (
                                        <div className="info-item">
                                            <strong>Prioridad:</strong>
                                            <span className={`priority ${selectedSubtask.task.priority}`}>
                                                {selectedSubtask.task.priority}
                                            </span>
                                        </div>
                                    )}
                                    {selectedSubtask.task.subject && (
                                        <div className="info-item">
                                            <strong>Materia:</strong>
                                            <span>{selectedSubtask.task.subject}</span>
                                        </div>
                                    )}
                                    {selectedSubtask.task.type && (
                                        <div className="info-item">
                                            <strong>Tipo:</strong>
                                            <span>{selectedSubtask.task.type}</span>
                                        </div>
                                    )}
                                    {selectedSubtask.task.due_date && (
                                        <div className="info-item">
                                            <strong>Fecha de entrega:</strong>
                                            <span>{new Date(selectedSubtask.task.due_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedSubtask.task.description && (
                                    <div className="info-item full-width">
                                        <strong>Descripción de la tarea:</strong>
                                        <p>{selectedSubtask.task.description}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodayPage;