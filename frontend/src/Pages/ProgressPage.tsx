import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import apiClient from '../Services/ApiClient'; 


interface Task {
  id: number;
  title: string;
  subject?: string;
  status: string;
  progress_percentage: number;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [tasks, setTasks] = useState<Task[]>([]); // Inicializa la lista en blanco
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('active'); 
  const [subjectFilter, setSubjectFilter] = useState('all');

  // --- OBTENER DATOS DEL BACKEND ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get<Task[]>('/api/task/');
        setTasks(response.data); // ¡Magia! Poblamos la lista con tu backend
      } catch (error) {
        console.error('Error cargando tareas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Extraemos una lista de materias únicas basándonos en 'tasks' (real)
  const subjects = Array.from(new Set(tasks.map(t => t.subject)));

  // Filtramos la lista real
  const filteredTasks = tasks.filter(task => {
    const isCompleted = task.status === 'completed';
    const passStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? isCompleted : 
      !isCompleted; 

    // Aquí evitamos que el filtro colapse si una tarea no tiene materia
    const taskSubject = task.subject || '';
    const passSubject = subjectFilter === 'all' || taskSubject === subjectFilter;

    return passStatus && passSubject;
  });

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', marginTop: '4rem' }}>
        <Clock className="animate-spin inline mr-2" /> Cargando tu progreso...
      </div>
    );
  }


  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-family, sans-serif)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
        Progreso de Actividades
      </h1>

      {/* --- BARRA DE FILTROS --- */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        
        {/* Selector de Estado */}
        <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button 
            onClick={() => setStatusFilter('active')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: statusFilter === 'active' ? 'white' : 'transparent', boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: statusFilter === 'active' ? 'bold' : 'normal', transition: 'all 0.2s' }}
          >
            En Curso
          </button>
          <button 
            onClick={() => setStatusFilter('completed')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: statusFilter === 'completed' ? 'white' : 'transparent', boxShadow: statusFilter === 'completed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: statusFilter === 'completed' ? 'bold' : 'normal', transition: 'all 0.2s' }}
          >
            Completadas
          </button>
          <button 
            onClick={() => setStatusFilter('all')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: statusFilter === 'all' ? 'white' : 'transparent', boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: statusFilter === 'all' ? 'bold' : 'normal', transition: 'all 0.2s' }}
          >
            Todas
          </button>
        </div>

        {/* Selector de Materia */}
        <select 
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}
        >
          <option value="all">Todas las materias</option>
          {subjects.map(sub => (
           (sub ? <option key={sub} value={sub}>{sub}</option> : null)
          ))}
        </select>
      </div>

      {/* --- LISTA DE TARJETAS --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px dashed #d1d5db' }}>
            No se encontraron tareas con estos filtros.
          </p>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id}
              onClick={() => navigate(`/activity/${task.id}`)}
              style={{ padding: '1.25rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.1s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#111827' }}>{task.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>
                    {task.subject || 'Sin materia'}
                  </span>
                </div>
                {task.status === 'completed' ? (
                  <CheckCircle size={22} color="#10b981" />
                ) : (
                  <Clock size={22} color="#f59e0b" />
                )}
              </div>
              
              {/* Barra de Progreso Interna */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem', fontWeight: '500' }}>
                  <span>Progreso</span>
                  <span>{Math.round(task.progress_percentage)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${task.progress_percentage}%`, backgroundColor: task.status === 'completed' ? '#10b981' : '#3b82f6', transition: 'width 0.8s ease-out' }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
