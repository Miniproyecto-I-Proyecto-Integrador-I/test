import { AlertTriangle } from 'lucide-react';

const ErrorState = () => {
  return (
    <div className="progress-page-container">
      <div className="progress-empty-state">
        <AlertTriangle size={100} className="progress-red-alert-icon" />
        <h2>¡Ups, parece que no podemos cargar tus tareas!</h2>
        <p>Ocurrió un error inesperado al intentar sincronizar tus datos.</p>
      </div>
    </div>
  );
};

export default ErrorState;
