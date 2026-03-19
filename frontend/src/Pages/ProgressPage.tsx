import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import apiClient from '../Services/ApiClient'; 
import './ProgressPage.css';

interface Subtask {
  id: number | string;
  description: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  subject?: string;
  status: string;
  progress_percentage: number;
  due_date?: string;
  subtasks?: Subtask[];
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // --- ESTADOS ---
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Filtros ('active' = Vigentes, 'completed' = Completadas, 'overdue' = Vencidas)
  const [statusFilter, setStatusFilter] = useState('active'); 

  // --- OBTENER DATOS DEL BACKEND ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get<Task[]>('/api/task/');
        setTasks(response.data); 
      } catch (error) {
        console.error('Error cargando tareas:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // --- FILTRADO AVANZADO ---
  const todayDate = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter(task => {
    const progress = task.progress_percentage || 0;
    const isCompleted = task.status === 'completed' || progress === 100;
    const isOverdue = !isCompleted && task.due_date && task.due_date < todayDate;

    if (statusFilter === 'active') return !isCompleted && !isOverdue;
    if (statusFilter === 'completed') return isCompleted;
    if (statusFilter === 'overdue') return isOverdue;
    return true;
  });

  // --- CALCULOS DEL RESUMEN ---
  const totalCompleted = tasks.filter(t => t.status === 'completed' || t.progress_percentage === 100).length;
  const totalPending = tasks.length - totalCompleted;

  // Tema CSS Dinámico
  const getThemeClass = () => {
    if (statusFilter === 'active') return 'theme-active';
    if (statusFilter === 'completed') return 'theme-completed';
    if (statusFilter === 'overdue') return 'theme-overdue';
    return 'theme-active';
  };
  const themeClass = getThemeClass();

  // Función para escrolear el carrusel
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getMonthName = () => {
    return new Date().toLocaleString('es-ES', { month: 'long' });
  };

  const formatDateLabel = (dateString?: string) => {
    if (!dateString) return "SIN FECHA";
    const dateObj = new Date(dateString + 'T00:00:00');
    return `${dateObj.getDate()} ${dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase()}, ${dateObj.getFullYear()}`;
  };

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <div className="progress-page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '10rem' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <Activity className="animate-pulse" size={48} style={{ margin: '0 auto 1rem', color: '#05c389' }} />
          <p>Cargando información del proyecto...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="progress-page-container">
        <div className="progress-empty-state">
          <AlertTriangle size={100} className="progress-red-alert-icon" />
          <h2>¡No se han podido guardar las tareas por favor recarga la página!</h2>
          <p>Ocurrió un error inesperado al intentar sincronizar tus datos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`progress-page-container ${themeClass}`}>
      
      {/* Cabecera */}
      <header className="progress-header">
        <div className="progress-title-wrapper">
          <div className="progress-logo-icon">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <h1>Progreso de las tareas</h1>
        </div>
        
        <select 
          className="progress-dropdown"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">Vigentes</option>
          <option value="completed">Completadas</option>
          <option value="overdue">Vencidas</option>
        </select>
      </header>

      {tasks.length === 0 ? (
        <div className="progress-empty-state">
          <div className="progress-empty-circle">
            <Check size={72} strokeWidth={4} />
          </div>
          <h2>¡Estás al día!</h2>
          <p>No tienes actividades pendientes en esta vista. Aprovecha para descansar o planificar tu próxima meta.</p>
          <button onClick={() => navigate('/create')} style={{ backgroundColor: '#05c389', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 6px rgba(5,195,137,0.2)' }}>
            + Crear nueva actividad
          </button>
        </div>
      ) : (
        <>
          {/* Título de Sección y Carrusel Nav */}
          <div className="progress-section-header">
            <h2 className="progress-section-title">
              {statusFilter === 'active' ? 'EN PROGRESO' : statusFilter === 'completed' ? 'COMPLETADAS' : 'VENCIDAS'}
            </h2>
            <div className="progress-carousel-nav">
              <button aria-label="Ver anteriores" onClick={() => scroll('left')}><ChevronLeft size={20} strokeWidth={3} /></button>
              <button aria-label="Ver siguientes" onClick={() => scroll('right')}><ChevronRight size={20} strokeWidth={3} /></button>
            </div>
          </div>

          {/* Carrusel de Tarjetas */}
          <div className="progress-cards-container" ref={scrollRef}>
            {filteredTasks.length === 0 ? (
               <div style={{ width: '100%', padding: '4rem', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
                 No se encontraron tareas con estos filtros.
               </div>
            ) : (
               filteredTasks.map(task => {
                 const subs = task.subtasks || [];
                 const completedSubsCount = subs.filter(s => s.status === 'completed').length;
                 const pct = Math.round(task.progress_percentage || 0);

                 return (
                   <div key={task.id} className="progress-card" onClick={() => navigate(`/activity/${task.id}`)}>
                     <h3>{task.title}</h3>
                     <p className="progress-card-due">
                       VENCE: {formatDateLabel(task.due_date)}
                     </p>

                     <div className="progress-card-bar-info">
                       <span>Progreso</span>
                       <span>{pct}%</span>
                     </div>
                     <div className="progress-card-bar-bg">
                       <div className="progress-card-bar-fill" style={{ width: `${pct}%` }} />
                     </div>

                     <div className="progress-card-subtasks-wrapper">
                       <p className="progress-card-subtasks-title">ACTIVIDADES ({completedSubsCount}/{subs.length})</p>
                       <div className="progress-card-subtasks-list">
                         {subs.map(sub => {
                           const isDone = sub.status === 'completed';
                           return (
                             <div key={sub.id} className={`progress-pill ${isDone ? 'completed' : ''}`}>
                               {isDone && statusFilter === 'completed' ? (
                                  <Check size={10} strokeWidth={4} />
                               ) : (
                                  <div className="progress-pill-dot" />
                               )}
                               <span>{sub.description.toUpperCase()}</span>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   </div>
                 );
               })
            )}
          </div>

          {/* Footer de Resumen */}
          <div className="progress-summary-banner">
            <div className="progress-summary-left">
              <div className="progress-summary-left-title">
                <Activity size={20} color="#05c389" />
                <span>Estado General del Proyecto</span>
              </div>
              <p>Tienes {totalPending} tareas <strong>por completar para</strong> este {getMonthName()}.</p>
            </div>
            
            <div className="progress-summary-right">
              <div className="progress-summary-stat">
                <h2>{totalCompleted}</h2>
                <span>Completadas</span>
              </div>
              <div className="progress-summary-divider" />
              <div className="progress-summary-stat">
                <h2>{totalPending}</h2>
                <span>Por completar</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
