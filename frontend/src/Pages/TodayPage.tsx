import React, { useEffect, useState } from 'react';
import { todayService } from '../Feature/ManageTodayPage/Services/TodayService';
import type { Task } from '../Feature/ManageTodayPage/Types/models';

const TodayPage: React.FC = () => {
    // Definimos que el estado es un array de Task
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {tasks.map(task => (
                <div key={task.id}>
                    <h3>{task.title}</h3>
                </div>
            ))}
        </div>
    );
};

export default TodayPage;