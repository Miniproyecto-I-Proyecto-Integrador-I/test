import type {Subtask} from '../Types/models'
import { useState, useEffect } from 'react';
import { todayService } from '../Services/todayService';
import {fechaMañana,fechaToday, fechaAyer} from '../Utils/DateFormatted'


export const useStatusCard = () => {
    const [defeatedSubTask, setDefeatedSubTask] = useState<Subtask>();
    const [todaySubTask, setTodaySubTask] = useState<Subtask>();
    const [nextSubTask, setNextSubTask] = useState<Subtask>();
    const [loading,setLoading] = useState(false)

    const nextSubTaskFiltre = {'planification_date_gte' : fechaMañana}
    const TodaySubTaskFiltre = {'planification_date_gte' : fechaToday}
    const defeatedSubTaskFiltre = {'planification_date_lte' : fechaAyer}

    useEffect(() => {
        setLoading(true)
        const loadTasks = async () => {
            try {
                const dataNextSubTask = await todayService.getFilterSubtasks(nextSubTaskFiltre);
                setNextSubTask(dataNextSubTask[0]);

                const dataTodaySubTask= await todayService.getFilterSubtasks(TodaySubTaskFiltre);
                setTodaySubTask(dataTodaySubTask[0])

                const dataDefeatedSubTask= await todayService.getFilterSubtasks(defeatedSubTaskFiltre);
                setDefeatedSubTask(dataDefeatedSubTask[0])

            } catch (error) {
                console.error('Error al cargar las tareas:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, []);


    return{
        defeatedSubTask,
        todaySubTask,
        nextSubTask,
        loading
    }

}
