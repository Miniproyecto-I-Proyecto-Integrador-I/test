import React, { useEffect, useState } from 'react';
import { todayService } from '../Feature/ManageTodayPage/Services/todayService';
import type { Task } from '../Feature/ManageTodayPage/Types/models';

const TodayPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await todayService.getTodayTasks();
                setTasks(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            {tasks.map(task => (
                <div key={task.id} style={styles.card}>

                    <h3 style={styles.title}>{task.title}</h3>

                    {task.description && (
                        <p style={styles.description}>
                            {task.description}
                        </p>
                    )}

                    {/* 🔵 SUBTAREAS */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <strong>Subtasks</strong>

                            {task.subtasks.map(sub => (
                                <div key={sub.id} style={styles.subtask}>
                                    • {sub.description}
                                    <span style={{ marginLeft: 8 }}>
                                        ({sub.status})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={styles.footer}>
                        {task.due_date && (
                            <span>
                                📅 {new Date(task.due_date).toLocaleString()}
                            </span>
                        )}

                        {/* 🔵 STATUS REAL */}
                        <span>
                            {task.status === "completed"
                                ? "✅ Done"
                                : "⏳ Pending"}
                        </span>

                    </div>
                </div>
            ))}
        </div>
    );

};

export default TodayPage;

const styles = {
    container: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "16px",
        padding: "20px"
    },

    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        transition: "0.2s",
    },

    title: {
        margin: "0 0 8px 0"
    },

    description: {
        color: "#555"
    },

    footer: {
        marginTop: "12px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.9rem",
        color: "#777"
    },
    subtask: {
        fontSize: "0.9rem",
        marginTop: "4px",
        color: "#444"
    }

};
