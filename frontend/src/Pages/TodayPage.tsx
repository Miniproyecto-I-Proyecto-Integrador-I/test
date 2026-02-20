import React, { useEffect, useState } from 'react';
import { todayService} from '../Feature/ManageTodayPage/Services/todayService';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';

const TodayPage: React.FC = () => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await todayService.getTodaySubtasks();
                setSubtasks(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    if (loading) return <div>Cargando...</div>;

    if (subtasks.length === 0) {
        return (
            <div style={styles.container}>
                <p>No tienes tareas pendientes para hoy</p>
                <button>Crear actividad</button>
            </div>
        );
    }

    const now = new Date(); 
    const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    const fecha = colombia.toISOString().split('T')[0];

    return (
        <div>
            <strong>Tareas de hoy {fecha} </strong>
            <div style={styles.container}>
                {subtasks.map(sub => (
                    <div key={sub.id} style={styles.card}>
                        <h4 style={styles.title}>{sub.description}</h4>
                        <div style={styles.subinfo}>
                            <span>Horas necesarias: {sub.needed_hours}</span>
                            {sub.task && (
                                <div style={styles.taskInfo}>
                                    <strong>Tarea principal: {sub.task.title}</strong>
                                    <span> ({sub.task.status})</span>
                                    {sub.task.due_date && (
                                        <div>
                                            fecha de entrega: {new Date(sub.task.due_date).toLocaleDateString()}
                                        </div>
                                    )}
                                    {sub.task.description && (
                                        <div>Description: {sub.task.description}</div>
                                    )}
                                    {sub.task.priority && (
                                        <div>Prioridad: {sub.task.priority}</div>
                                    )}
                                    {sub.task.subject && (
                                        <div>Materia: {sub.task.subject}</div>
                                    )}
                                    {sub.task.type && (
                                        <div>Tipo: {sub.task.type}</div>
                                    )}
                                    {sub.task.total_hours !== undefined && (
                                        <div>Total de horas: {sub.task.total_hours}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayPage;

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        padding: '20px'
    },

    card: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        transition: '0.2s',
    },

    title: {
        margin: '0 0 8px 0'
    },

    description: {
        color: '#555'
    },

    footer: {
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        color: '#777'
    },
    subtask: {
        fontSize: '0.9rem',
        marginTop: '4px',
        color: '#444'
    },
    subinfo: {
        fontSize: '0.9rem',
        color: '#444',
        marginTop: '8px'
    },
    taskInfo: {
        marginTop: '4px',
        fontSize: '0.8rem',
        color: '#666'
    }
};
