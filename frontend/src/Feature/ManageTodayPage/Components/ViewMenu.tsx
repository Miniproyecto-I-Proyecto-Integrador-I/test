import React, { useRef, useEffect } from 'react';
import '../Styles/ViewMenu.css';

interface ViewOptions {
  overdue: boolean;
  today: boolean;
  upcoming: boolean;
}

interface ViewMenuProps {
  viewOptions: ViewOptions;
  setViewOptions: React.Dispatch<React.SetStateAction<ViewOptions>>;
  showViewMenu: boolean;
  setShowViewMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewMenu: React.FC<ViewMenuProps> = ({
  viewOptions,
  setViewOptions,
  showViewMenu,
  setShowViewMenu,
}) => {
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const dropdownId = 'view-menu-dropdown';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        viewMenuRef.current &&
        !viewMenuRef.current.contains(event.target as Node)
      ) {
        setShowViewMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowViewMenu]);

  return (
    <div className="view-menu-wrapper" ref={viewMenuRef}>
      <button
        className="btn-primary view-menu-trigger"
        onClick={() => setShowViewMenu(!showViewMenu)}
        aria-expanded={showViewMenu}
        aria-controls={dropdownId}
        aria-haspopup="true"
      >
        Filtrar secciones visibles
      </button>
      {showViewMenu && (
        <div
          className="view-menu-dropdown"
          id={dropdownId}
          role="group"
          aria-label="Secciones visibles"
        >
          <span className="view-menu-title">Secciones Visibles</span>
          <label className="view-menu-label">
            <input
              type="checkbox"
              className="view-menu-checkbox"
              checked={viewOptions.overdue}
              onChange={() =>
                setViewOptions((prev) => ({ ...prev, overdue: !prev.overdue }))
              }
            />
            Vencidas
          </label>
          <label className="view-menu-label">
            <input
              type="checkbox"
              className="view-menu-checkbox"
              checked={viewOptions.today}
              onChange={() =>
                setViewOptions((prev) => ({ ...prev, today: !prev.today }))
              }
            />
            Para Hoy
          </label>
          <label className="view-menu-label">
            <input
              type="checkbox"
              className="view-menu-checkbox"
              checked={viewOptions.upcoming}
              onChange={() =>
                setViewOptions((prev) => ({
                  ...prev,
                  upcoming: !prev.upcoming,
                }))
              }
            />
            Próximas
          </label>
        </div>
      )}
    </div>
  );
};

export default ViewMenu;
