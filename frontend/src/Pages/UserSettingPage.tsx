import { Info, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import InfoTooltip from '../shared/Components/InfoTooltip';
import { useToast } from '../shared/Hooks/useToast';
import ToastHost from '../shared/Components/ToastHost';
import PendingForm from '../Feature/ManageUserPage/Components/PendingForm';
import type { PendingConflictDay } from '../Feature/ManageUserPage/Types/pending.types';
import type { ConflictTask } from '../Feature/ManageConflict/Types/conflict';
import apiClient from '../Services/ApiClient';
import '../Feature/ManageUserPage/Styles/Usersettingstyle.css';

interface UserSetting {
  username: string;
  email: string;
  dailyLimit: number;
}
const TOAST_TRANSITION_GAP_MS = 850;

const UserSettingPage: React.FC = () => {
  const { user, updateDailyLimit } = useAuth();
  const { toasts, success, error, loading: toastLoading, dismiss } = useToast();
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isRetryingFromModal, setIsRetryingFromModal] = useState(false);
  const [conflictDays, setConflictDays] = useState<PendingConflictDay[]>([]);
  const [userSetting, setUserSetting] = useState<UserSetting>({
    username: user?.username || '',
    email: user?.email || '',
    dailyLimit: user?.daily_hours || 0,
  });

  const initialDailyLimit = user?.daily_hours ?? 0;

  const handleClickPlus = () => {
    if (userSetting.dailyLimit < 16) {
      setUserSetting({
        ...userSetting,
        dailyLimit: userSetting.dailyLimit + 1,
      });
    }
  };

  const handleClickMinus = () => {
    if (userSetting.dailyLimit > 1) {
      setUserSetting({
        ...userSetting,
        dailyLimit: userSetting.dailyLimit - 1,
      });
    }
  };

  const handleSave = async (fromModal = false) => {
    if (userSetting.dailyLimit === user?.daily_hours) {
      success('¡Todo listo!', 'No hay cambios para guardar.');
      return;
    }

    if (fromModal) {
      setIsRetryingFromModal(true);
    }

    try {
      await updateDailyLimit(userSetting.dailyLimit);
      setIsPendingModalOpen(false);
      setConflictDays([]);
      success('¡Todo listo!', 'Tus cambios se han guardado correctamente.');
    } catch (err: any) {
      if (err.response?.status === 409) {
        const responseConflicts = Array.isArray(err.response?.data)
          ? (err.response.data as PendingConflictDay[])
          : [];

        setConflictDays(responseConflicts);

        if (fromModal) {
          error('Aun no has resuelto todos los conflictos!');
        } else {
          setIsPendingModalOpen(true);
        }
      } else {
        error(
          'Error al guardar',
          'Algo salió mal, por favor intenta de nuevo.',
        );
      }
      console.error(err);
      console.log(err.response?.data);
    } finally {
      if (fromModal) {
        setIsRetryingFromModal(false);
      }
    }
  };

  const handleDayResolved = async (
    fecha: string,
    resolvedTasks: ConflictTask[],
  ) => {
    const loadId = toastLoading(
      'Guardando resolución…',
      'Aplicando cambios en el backend',
    );

    const dayData = conflictDays.find((d) => d.fecha === fecha);
    const originals = new Map(
      (dayData?.subtasks ?? []).map((st) => [String(st.id), Number(st.horas)]),
    );

    try {
      await Promise.all(
        resolvedTasks.map((task) => {
          const origHours = originals.get(task.id);
          const changedHours =
            origHours !== undefined && task.hours !== origHours;
          const changedDate = task.date !== fecha;
          if (changedHours || changedDate) {
            return apiClient.patch(`/api/subtasks/${task.id}/`, {
              needed_hours: task.hours,
              planification_date: task.date,
            });
          }
          return Promise.resolve();
        }),
      );

      setConflictDays((prev) => prev.filter((d) => d.fecha !== fecha));
      dismiss(loadId);
      await new Promise((resolve) =>
        setTimeout(resolve, TOAST_TRANSITION_GAP_MS),
      );
      success(
        '¡Conflicto resuelto!',
        'Los cambios del día se guardaron correctamente.',
      );
    } catch (err) {
      dismiss(loadId);
      await new Promise((resolve) =>
        setTimeout(resolve, TOAST_TRANSITION_GAP_MS),
      );
      error(
        'Error al guardar conflicto',
        'Ocurrió un error inesperado al guardar los cambios del día.',
      );
      throw err;
    }
  };

  const handleAbortPendingResolution = () => {
    setUserSetting((prev) => ({ ...prev, dailyLimit: initialDailyLimit }));
    setIsPendingModalOpen(false);
    setConflictDays([]);
    success(
      'Resolucion abortada',
      'No se aplicaron los cambios a tu limite diario',
    );
  };

  return (
    <div className="user-setting-container">
      <h1 className="user-setting-title">Configuración de Perfil</h1>
      <p className="user-setting-description">
        Administra la información de tu cuenta y preferencias.
      </p>

      <div className="user-setting-card">
        <div className="user-setting-section">
          <h2 className="user-setting-section-title">Nombre de usuario</h2>
          <div className="user-setting-section-content">
            <div className="input-container">
              <Lock size={16} className="input-icon" />
              <input type="text" disabled value={userSetting.username} />
            </div>
            <span className="read-only-badge">Solo lectura</span>
          </div>
          <p className="info-text">
            <Info size={15} /> El nombre de usuario no se puede cambiar.
          </p>
        </div>

        <hr className="user-setting-divider" />

        <div className="user-setting-section">
          <h2 className="user-setting-section-title">Correo electrónico</h2>
          <div className="user-setting-section-content">
            <div className="input-container">
              <Lock size={16} className="input-icon" />
              <input type="email" disabled value={userSetting.email} />
            </div>
            <span className="read-only-badge">Solo lectura</span>
          </div>
          <p className="info-text">
            <Info size={15} /> El correo de usuario no se puede cambiar.
          </p>
        </div>

        <hr className="user-setting-divider" />

        <div className="user-setting-section">
          <div className="user-setting-title-row">
            <h2 className="user-setting-section-title">
              Límite diario de horas
            </h2>
            <div className="user-setting-section-tooltip">
              <InfoTooltip content="El límite diario establece la cantidad máxima de horas que deseas dedicar a tus actividades cada día" />
            </div>
          </div>
          <div className="user-setting-section-content">
            <button className="hour-button" onClick={handleClickMinus}>
              -
            </button>
            <input
              className="hour-input"
              type="number"
              value={userSetting.dailyLimit}
              disabled
              max={16}
              min={1}
              onChange={(e) =>
                setUserSetting({
                  ...userSetting,
                  dailyLimit: Number(e.target.value),
                })
              }
            />
            <button className="hour-button" onClick={handleClickPlus}>
              +
            </button>
            <p className="user-setting-section-content-text">horas por día</p>
          </div>
        </div>

        <hr className="user-setting-divider" />

        <div className="user-setting-footer">
          <button className="save-button" onClick={() => handleSave(false)}>
            Guardar Cambios
          </button>
        </div>
      </div>
      <PendingForm
        isOpen={isPendingModalOpen}
        conflictDays={conflictDays}
        newDailyLimit={userSetting.dailyLimit}
        onAbort={handleAbortPendingResolution}
        onSolve={() => handleSave(true)}
        onDayResolved={handleDayResolved}
        isSolving={isRetryingFromModal}
      />
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default UserSettingPage;
