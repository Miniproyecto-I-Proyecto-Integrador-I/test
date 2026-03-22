import { useState, useEffect } from 'react';
import { fetchTasks } from '../Services/ProgressService';
import type { Task } from '../Utils/types';

export const useProgressTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Error cargando tareas:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  return { tasks, loading, hasError };
};
