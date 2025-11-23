import React, { useMemo, useId } from 'react';
import PropTypes from 'prop-types';

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-orange-100 text-orange-700',
  advanced: 'bg-rose-100 text-rose-700'
};

const LevelSelector = ({
  levels = [],
  currentLevelId = '',
  onSelect,
  disabled = false,
}) => {
  const selectId = useId();
  const helperTextId = useId();
  const activeLevel = useMemo(
    () => levels.find(level => level.id === currentLevelId) ?? null,
    [levels, currentLevelId]
  );
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-600" htmlFor={selectId}>Nivel</label>
      <select
        id={selectId}
        value={currentLevelId ?? ''}
        onChange={(event) => onSelect?.(event.target.value)}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : 'false'}
        aria-describedby={activeLevel ? helperTextId : undefined}
        className="w-full min-w-[220px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="" disabled>Selecciona un escenario…</option>
        {levels.map(level => (
          <option key={level.id} value={level.id}>
            {level.name}
          </option>
        ))}
      </select>
      {activeLevel ? (
        <span
          id={helperTextId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`inline-flex w-max items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${difficultyColors[activeLevel.difficulty] ?? 'bg-slate-100 text-slate-700'}`}
        >
          Dificultad: {activeLevel.difficulty ?? 'personalizada'}
        </span>
      ) : null}
    </div>
  );
};

LevelSelector.propTypes = {
  levels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    difficulty: PropTypes.string,
  })),
  currentLevelId: PropTypes.string,
  onSelect: PropTypes.func,
  disabled: PropTypes.bool,
};

export default LevelSelector;
