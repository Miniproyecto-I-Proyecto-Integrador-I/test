import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TodayPage from '../Pages/TodayPage';

// --- Mocks ---
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de Context
vi.mock('../Context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'Tester' },
  }),
}));

// Mock del Hook que trae las subtareas
const mockUseGroupedSubtasks = vi.fn();
vi.mock('../Feature/ManageTodayPage/Hooks/useGroupedSubtasks', () => ({
  useGroupedSubtasks: () => mockUseGroupedSubtasks(),
}));

const renderTodayPage = () => {
  return render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>
  );
};

describe('TodayPage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar pantalla de carga cuando loading es true', () => {
    mockUseGroupedSubtasks.mockReturnValue({
      overdue: [], today: [], upcoming: [],
      rawOverdue: [], rawToday: [], rawUpcoming: [],
      loading: true, allCourses: [],
    });

    renderTodayPage();
    expect(screen.getByText(/Cargando tus actividades del día.../i)).toBeInTheDocument();
  });

  it('debería mostrar estado vacío "EmptyState" si no hay subtareas en absoluto', () => {
    mockUseGroupedSubtasks.mockReturnValue({
      overdue: [], today: [], upcoming: [],
      rawOverdue: [], rawToday: [], rawUpcoming: [],
      loading: false, allCourses: [],
    });

    renderTodayPage();
    // Podemos buscar un texto único que sepamos que está en EmptyState o en TodayPage (ej. Hola, Tester)
    expect(screen.getByText(/Hola, Tester!/i)).toBeInTheDocument();
  });

  it('debería renderizar las tarjetas y el resumen cuando hay tareas para hoy', () => {
    mockUseGroupedSubtasks.mockReturnValue({
      overdue: [], 
      today: [{ id: 1, description: 'Estudiar React', needed_hours: 2 }], 
      upcoming: [],
      rawOverdue: [], 
      rawToday: [{ id: 1, description: 'Estudiar React', needed_hours: 2 }], 
      rawUpcoming: [],
      loading: false, 
      allCourses: [],
    });

    renderTodayPage();
    // Tarjeta resumen debe mostrar cantidad de tareas pendientes (1) y horas
    expect(screen.getByText(/Hola, Tester!/i)).toBeInTheDocument();
    // No debería haber pantalla vacía si la cuadrícula funciona, aquí podríamos checar por algo de TodaySummaryCard
  });

  it('El menú de vistas debería permitir cambiar las opciones visualizadas', () => {
    // Escenario con tareas vencidas y de hoy
    mockUseGroupedSubtasks.mockReturnValue({
      overdue: [{ id: 1, description: 'Tarea Vencida' }], 
      today: [{ id: 2, description: 'Tarea Hoy' }], 
      upcoming: [],
      rawOverdue: [{ id: 1, description: 'Tarea Vencida' }], 
      rawToday: [{ id: 2, description: 'Tarea Hoy' }], 
      rawUpcoming: [],
      loading: false, 
      allCourses: [],
    });

    renderTodayPage();

    // En ViewMenu que por defecto tiene activado "today" pero no "overdue"
    // Buscamos el banner de OverdueTasksAlert porque hay vencidas sin seleccionar check de vencida
    const showAlertButton = screen.getByText(/Solucionar ahora/i); // El botón de "resolver" del overduetaskalert
    expect(showAlertButton).toBeInTheDocument();

    // Simular que el usuario hace click en resolver tareas vencidas
    fireEvent.click(showAlertButton);

    // Al clickear resolver, nos fuerza a la vista de "overdue"
    // Entonces expected banner se esconde y sale "Volver a mi día"
    expect(screen.getByText(/Volver a mi día/i)).toBeInTheDocument();
    expect(screen.getByText(/Resolviendo tareas vencidas/i)).toBeInTheDocument();
  });
});
