import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GameHeader from './GameHeader';
import { TEXT } from '../config/textContent';

const createProps = (overrides = {}) => ({
  levelName: 'Nivel 1',
  levels: [{ id: '1', name: 'Nivel 1' }],
  currentLevelId: '1',
  onSelectLevel: vi.fn(),
  loadingLevel: false,
  score: 120,
  foundDifferencesCount: 2,
  totalDifferences: 5,
  formattedTime: '02:00',
  timeLeft: 120,
  gameStarted: true,
  onResetGame: vi.fn(),
  isDevMode: true,
  editMode: false,
  onToggleEditMode: vi.fn(),
  onExportLevel: vi.fn(),
  onImportLevel: vi.fn(),
  ...overrides,
});

describe('GameHeader', () => {
  it('muestra los textos principales y métrica de puntuación', () => {
  render(<GameHeader {...createProps()} />);

    expect(screen.getByText(TEXT.header.title)).toBeInTheDocument();
    expect(screen.getByText(TEXT.header.metrics.points)).toBeInTheDocument();
    expect(screen.getByText(TEXT.header.metrics.found)).toBeInTheDocument();
    expect(screen.getByText(TEXT.header.metrics.time)).toBeInTheDocument();
  });

  it('ejecuta las acciones del modo desarrollador', () => {
    const props = createProps();
    render(<GameHeader {...props} />);

    fireEvent.click(screen.getByText(TEXT.header.buttons.restart));
    fireEvent.click(screen.getByText(TEXT.header.buttons.export));
    fireEvent.click(screen.getByText(TEXT.header.buttons.import));
    fireEvent.click(screen.getByText(TEXT.header.buttons.editMode));

    expect(props.onResetGame).toHaveBeenCalled();
    expect(props.onExportLevel).toHaveBeenCalled();
    expect(props.onImportLevel).not.toHaveBeenCalled();
    expect(props.onToggleEditMode).toHaveBeenCalled();
  });
});
