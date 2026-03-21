import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Calendar, Clock3, StickyNote } from 'lucide-react';
import type { Subtask } from '../Types/models';
import { buildBadgeLabel, type CardVariant } from '../Utils/BadgeLabels';
import '../Styles/CardTasks.css';
import PostponeModal from './PostponeModal';
import { todayService } from '../Services/todayService';

interface CardTaskProps {
  sub: Subtask;
  variant: CardVariant;
  onClick: () => void;
  onRescheduleClick?: () => void;
  onSubtaskUpdated?: () => Promise<void>;
  onActionError?: (title: string, subtitle?: string) => void;
  onMarkedCompleted?: (subtaskId: number) => void;
  animateUndoPopIn?: boolean;
}

const CardTask: React.FC<CardTaskProps> = ({
  sub,
  variant,
  onClick,
  onRescheduleClick,
  onSubtaskUpdated,
  onActionError,
  onMarkedCompleted,
  animateUndoPopIn = false,
}) => {
  const POP_OUT_DURATION_MS = 220;
  const POP_IN_DURATION_MS = 260;
  const [checked, setChecked] = useState(sub.status === 'completed');
  const [isPoppingOut, setIsPoppingOut] = useState(false);
  const [isPoppingIn, setIsPoppingIn] = useState(false);
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);
  const [isReadNoteModalOpen, setIsReadNoteModalOpen] = useState(false);
  const [postponeNote, setPostponeNote] = useState('');
  const [isSubmittingPostpone, setIsSubmittingPostpone] = useState(false);
  const popOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parentTaskTitle = sub.task?.title || 'Sin tarea asiganda';
  const timeInfo = sub.needed_hours ? `${sub.needed_hours}h` : '';
  const badgeLabel = buildBadgeLabel(variant, sub);
  const hasNote = useMemo(
    () => Boolean(sub.note && sub.note.trim() !== ''),
    [sub.note],
  );
  const noteText = sub.note?.trim() || '';
  const isCurrentlyPostponed = sub.status === 'postponed';
  const showPostponeAction = variant === 'today' && !isCurrentlyPostponed;
  const showPostponeStatus = variant === 'today' && isCurrentlyPostponed;
  const isPostponedCard = variant === 'today' && isCurrentlyPostponed;
  const isActivePostponeCard = variant === 'today' && showPostponeAction;
  const noteToneClass =
    sub.status === 'postponed'
      ? 'task-card__note-icon-btn--postponed'
      : variant === 'overdue'
        ? 'task-card__note-icon-btn--overdue'
        : variant === 'upcoming'
          ? 'task-card__note-icon-btn--upcoming'
          : 'task-card__note-icon-btn--today';

  let displayTimeInfo = timeInfo;
  if (variant === 'overdue' && sub.planification_date) {
    const formattedDate = new Date(
      sub.planification_date + 'T00:00:00',
    ).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    displayTimeInfo = timeInfo ? `${timeInfo} • ${formattedDate}` : formattedDate;
  }

  useEffect(() => {
    setChecked(sub.status === 'completed');
    if (sub.status !== 'completed') {
      setIsPoppingOut(false);
    }
  }, [sub.status]);

  useEffect(() => {
    return () => {
      if (popOutTimeoutRef.current) {
        clearTimeout(popOutTimeoutRef.current);
      }
      if (popInTimeoutRef.current) {
        clearTimeout(popInTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!animateUndoPopIn) return;

    setIsPoppingIn(true);
    if (popInTimeoutRef.current) {
      clearTimeout(popInTimeoutRef.current);
    }

    popInTimeoutRef.current = setTimeout(() => {
      setIsPoppingIn(false);
    }, POP_IN_DURATION_MS);
  }, [animateUndoPopIn]);

  const handleCheckChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const isChecked = event.target.checked;
    setChecked(isChecked);

    try {
      await todayService.updateSubtaskStatus(
        sub.id,
        isChecked ? 'completed' : 'pending',
      );

      if (isChecked) {
        onMarkedCompleted?.(sub.id);
        setIsPoppingOut(true);
        popOutTimeoutRef.current = setTimeout(() => {
          void onSubtaskUpdated?.();
        }, POP_OUT_DURATION_MS);
        return;
      }

      setIsPoppingOut(false);
      await onSubtaskUpdated?.();
    } catch (error) {
      console.error('Error al guardar estado de la tarea', error);
      setChecked(!isChecked);
      setIsPoppingOut(false);
      onActionError?.(
        'Error al actualizar estado',
        isChecked
          ? 'No se pudo marcar la subtarea como completada. No se realizaron cambios.'
          : 'No se pudo desmarcar la subtarea. No se realizaron cambios.',
      );
    }
  };

  const handleOpenPostponeModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPostponeNote(noteText);
    setIsPostponeModalOpen(true);
  };

  const handleConfirmPostpone = async () => {
    try {
      setIsSubmittingPostpone(true);
      await todayService.postponeSubtask(sub.id, postponeNote);
      setIsPostponeModalOpen(false);
      setPostponeNote('');
      await onSubtaskUpdated?.();
    } catch (error) {
      console.error('Error al posponer subtarea:', error);
      onActionError?.(
        'Error al posponer',
        'No se pudo posponer la subtarea. No se realizaron cambios.',
      );
    } finally {
      setIsSubmittingPostpone(false);
    }
  };

  const openReadNoteModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!hasNote) {
      return;
    }
    setIsReadNoteModalOpen(true);
  };

  return (
    <>
      <div
        className={`task-card${checked ? ' task-card--done' : ''}${isPoppingOut ? ' task-card--pop-out' : ''}${isPoppingIn ? ' task-card--pop-in' : ''}`}
        onClick={onClick}
      >
        {variant !== 'overdue' && (
          <input
            type="checkbox"
            className="task-card__check"
            checked={checked}
            onChange={handleCheckChange}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Marcar "${sub.description}" como completada`}
          />
        )}

        <div className={`task-card__body${isPostponedCard ? ' task-card__body--postponed' : ''}`}>
          {isPostponedCard ? (
            <>
              <div className="task-card__title-row">
                <p className="task-card__title">{sub.description}</p>
                {hasNote && (
                  <button
                    type="button"
                    className={`task-card__note-icon-btn task-card__note-icon-btn--inline ${noteToneClass}`}
                    onClick={openReadNoteModal}
                    title={noteText}
                    aria-label="Ver nota de subtarea"
                  >
                    <StickyNote size={16} />
                  </button>
                )}
              </div>
              <p className="task-card__parent-task task-card__parent-task--full">
                {parentTaskTitle}
              </p>
            </>
          ) : variant === 'overdue' ? (
            <>
              <p className="task-card__title">{sub.description}</p>
            <div className="task-card__info-col">
              <p className="task-card__parent-task">{parentTaskTitle}</p>
              <span className="task-card__badge">
                <Clock size={13} />
                {displayTimeInfo || badgeLabel}
              </span>
            </div>
            </>
          ) : isActivePostponeCard ? (
            <>
              <p className="task-card__title">{sub.description}</p>
              <p className="task-card__parent-task task-card__parent-task--full">
                {parentTaskTitle}
              </p>
            </>
          ) : (
            <>
              <p className="task-card__title">{sub.description}</p>
              <div className="task-card__info-row">
                <p className="task-card__parent-task">{parentTaskTitle}</p>
                <span className="task-card__badge">
                  {variant === 'upcoming' ? <Calendar size={13} /> : <Clock size={13} />}
                  {timeInfo || badgeLabel}
                </span>
              </div>
            </>
          )}
        </div>

        {hasNote && !isPostponedCard && (
          <button
            type="button"
            className={`task-card__note-icon-btn ${noteToneClass}`}
            onClick={openReadNoteModal}
            title={noteText}
            aria-label="Ver nota de subtarea"
          >
            <StickyNote size={16} />
          </button>
        )}

        {isPostponedCard && (
          <span className="task-card__badge task-card__badge--postponed-right">
            <Clock size={13} />
            {timeInfo || badgeLabel}
          </span>
        )}

        {isActivePostponeCard && (
          <span className="task-card__badge task-card__badge--action-aligned">
            <Clock size={13} />
            {timeInfo || badgeLabel}
          </span>
        )}

        {(variant === 'overdue' || showPostponeAction || showPostponeStatus) && (
          <div
            className={`task-card__actions${showPostponeStatus ? ' task-card__actions--postponed' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            {variant === 'overdue' && (
              <button
                className="task-card__action-btn reschedule-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onRescheduleClick?.();
                }}
                aria-label={`Reprogramar "${sub.description}"`}
              >
                Reprogramar
              </button>
            )}

            {showPostponeStatus ? (
              <button
                className="task-card__action-btn postpone-btn postpone-btn--disabled"
                type="button"
                disabled
                aria-label={`Subtarea "${sub.description}" ya pospuesta`}
              >
                Pospuesta
              </button>
            ) : showPostponeAction ? (
              <button
                className="task-card__action-btn postpone-btn"
                onClick={handleOpenPostponeModal}
                aria-label={`Posponer "${sub.description}"`}
              >
                <Clock3 size={14} />
                Posponer
              </button>
            ) : null}
          </div>
        )}
      </div>

      <PostponeModal
        isOpen={isPostponeModalOpen}
        mode="write"
        subtask={sub}
        noteValue={postponeNote}
        loading={isSubmittingPostpone}
        onClose={() => {
          if (!isSubmittingPostpone) {
            setIsPostponeModalOpen(false);
            setPostponeNote('');
          }
        }}
        onNoteChange={setPostponeNote}
        onConfirm={handleConfirmPostpone}
      />

      <PostponeModal
        isOpen={isReadNoteModalOpen}
        mode="read"
        subtask={sub}
        noteValue={noteText}
        onClose={() => setIsReadNoteModalOpen(false)}
      />
    </>
  );
};

export default CardTask;
