import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DifferencesPanel from './DifferencesPanel';
import { TEXT } from '../config/textContent';

const differences = [
  { id: 1, name: null, type: 'circle', x: 10, y: 15, radius: 8 },
];

const findDifferenceTitle = () => {
  const matches = screen.getAllByText((_, element) => (
    element?.textContent?.replace(/\s+/g, ' ').includes(`${TEXT.panel.emptyName} 1`)
  ));
  return matches[0];
};

const findDifferenceCard = () => screen.getByTestId('difference-card-1');

const createProps = (overrides = {}) => ({
  differences,
  foundDifferences: [],
  selectedDifferenceId: null,
  onSelectDifference: vi.fn(),
  hintShapeSummary: () => 'Resumen',
  isDevMode: false,
  editMode: false,
  onChangeShape: vi.fn(),
  onSizeInput: vi.fn(),
  onAdjustRadius: vi.fn(),
  onAdjustDimension: vi.fn(),
  onAdjustTolerance: vi.fn(),
  onRemoveDifference: vi.fn(),
  onCopyDifference: vi.fn(),
  ...overrides,
});

describe('DifferencesPanel', () => {
  it('muestra el título y la diferencia con nombre por defecto', () => {
  render(<DifferencesPanel {...createProps()} />);

    expect(screen.getByText(TEXT.panel.title)).toBeInTheDocument();
    expect(findDifferenceTitle()).toBeInTheDocument();
  });

  it('permite seleccionar una diferencia en modo edición', () => {
    const props = createProps({ isDevMode: true, editMode: true });
    render(<DifferencesPanel {...props} />);

    fireEvent.click(findDifferenceCard());
    expect(props.onSelectDifference).toHaveBeenCalledWith(1);
    expect(screen.getByText(TEXT.panel.fields.shape)).toBeInTheDocument();
  });
});
