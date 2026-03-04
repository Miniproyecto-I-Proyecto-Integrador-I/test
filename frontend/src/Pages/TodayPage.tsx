import React, { useEffect, useState } from 'react';

import { todayService } from '../Feature/ManageTodayPage/Services/todayService';
import { useAuth } from '../Context/AuthContext';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';
import '../Feature/ManageTodayPage/Styles/TodayPage.css';
import SelectedSubtask from '../Feature/ManageTodayPage/Components/SelectedSubtask'
import EmptyState from '../Feature/ManageTodayPage/Components/EmptyState';
import CardsGrid from '@/Feature/ManageTodayPage/Components/CardsGrid';
import SelectedFilter from '@/Feature/ManageTodayPage/Components/SelectedFilter';
import {fecha} from '../Feature/ManageTodayPage/Utils/DateFormatted'

const TodayPage: React.FC = () => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const { user } = useAuth();

  const fetchSubtasks = async (customFilters?: Record<string, string>) => {
    setLoading(true);
    try {
      const filtersToUse =
        customFilters !== undefined ? customFilters : filters;
      const data = await todayService.getTodaySubtasks(filtersToUse);
      console.log('DATA:', data);
      setSubtasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchSubtasks();
  };

  const clearFilters = () => {
    setFilters({});
    fetchSubtasks({});
  };

  const onClose = () => {
    setSelectedSubtask(null)
  }

  if (loading) {
    return (
      <div className="today-loading-state">
        <div className="spinner"></div>
        <p>Cargando tus tareas de hoy...</p>
      </div>
    );
  }


  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <h2 className="today-greeting">Hola, {user?.username}!</h2>
          <h1 className="today-title">Mi Día</h1>
        </div>
        <p className="today-date">
          {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
        </p>
      </header>

      <SelectedFilter handleFilterChange={handleFilterChange} applyFilters={applyFilters} clearFilters = {clearFilters} filters = {filters} />

      {subtasks.length === 0 ? (
        <EmptyState/>
      ) : (
        <CardsGrid subtasks = {subtasks} setSelectedSubtask = {setSelectedSubtask}/>
      )}
      {selectedSubtask && (
        <SelectedSubtask onClose = {onClose} selectedSubtask = {selectedSubtask}/>
      )
      }
    </div>
  )
}


export default TodayPage;
