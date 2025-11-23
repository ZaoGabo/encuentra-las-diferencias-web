import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ImageCanvas from './ImageCanvas';

const renderCanvas = (props = {}) => render(
  <ImageCanvas
    title="Imagen Original"
    imageSrc="/original.png"
    onPlayClick={vi.fn()}
    {...props}
  />
);

describe('ImageCanvas', () => {
  it('invoca onPlayClick cuando no está en modo edición', () => {
    const onPlayClick = vi.fn();
    renderCanvas({ onPlayClick });

    fireEvent.click(screen.getByRole('img', { name: 'Imagen Original' }));

    expect(onPlayClick).toHaveBeenCalledTimes(1);
  });

  it('invoca onEditClick cuando está en modo edición', () => {
    const onEditClick = vi.fn();
    renderCanvas({ onEditClick, isDevMode: true, editMode: true });

    fireEvent.click(screen.getByRole('img', { name: 'Imagen Original' }));

    expect(onEditClick).toHaveBeenCalledTimes(1);
  });
});
