import React from 'react';
import PropTypes from 'prop-types';
import { TEXT } from '../config/textContent';

const ImageCanvas = ({
  title,
  containerRef = null,
  imageSrc = '',
  fallbackTitle = TEXT.canvas.fallbackTitle,
  fallbackDescription = 'Verifica que la ruta del asset sea correcta.',
  borderClass = 'border-gray-200',
  isDevMode = false,
  editMode = false,
  onPlayClick,
  onEditClick,
  overlays = null,
}) => {
  const handleClick = (event) => {
    if (isDevMode && editMode) {
      onEditClick?.(event);
    } else {
      onPlayClick?.(event);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-2xl backdrop-blur">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">{title}</h2>
      <div
        ref={containerRef}
        className={`relative cursor-crosshair overflow-hidden rounded-2xl border-4 ${borderClass} shadow-2xl`}
        role="button"
        tabIndex={0}
        aria-label={`Zona interactiva: ${title}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <img
          src={imageSrc}
          alt={title}
          className="w-full select-none"
          draggable="false"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            if (event.currentTarget.nextSibling) event.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden h-96 w-full flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-8 text-center text-gray-600">
          <p className="text-xl font-semibold">{fallbackTitle}</p>
          <p className="mt-2 text-sm">{fallbackDescription}</p>
        </div>
        {overlays}
      </div>
    </div>
  );
};


ImageCanvas.propTypes = {
  title: PropTypes.string.isRequired,
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  imageSrc: PropTypes.string,
  fallbackTitle: PropTypes.string,
  fallbackDescription: PropTypes.string,
  borderClass: PropTypes.string,
  isDevMode: PropTypes.bool,
  editMode: PropTypes.bool,
  onPlayClick: PropTypes.func,
  onEditClick: PropTypes.func,
  overlays: PropTypes.node,
};

export default React.memo(ImageCanvas);

