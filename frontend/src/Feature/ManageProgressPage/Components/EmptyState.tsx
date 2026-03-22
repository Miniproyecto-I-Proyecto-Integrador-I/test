import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const EmptyState = () => {
  const navigate = useNavigate();
  return (
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
  );
};

export default EmptyState;
