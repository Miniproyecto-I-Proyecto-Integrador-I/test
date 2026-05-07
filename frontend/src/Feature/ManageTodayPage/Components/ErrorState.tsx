import { AlertTriangle } from 'lucide-react';

const ErrorState = () => {
  return (
    <div className="today-error-state">
      <AlertTriangle size={96} className="today-error-state__icon" />
      <h2>¡Ups, no pudimos cargar tus tareas!</h2>
      <p>
        Ocurrió un error al intentar sincronizar tus actividades. Inténtalo de
        nuevo en unos segundos.
      </p>
    </div>
  );
};

export default ErrorState;
