import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { TEXT } from '../config/textContent';

const DifferencesPanel = ({
  differences = [],
  foundDifferences = [],
  selectedDifferenceId = null,
  onSelectDifference,
  hintShapeSummary,
  isDevMode = false,
  editMode = false,
  onChangeShape,
  onSizeInput,
  onAdjustRadius,
  onAdjustDimension,
  onAdjustTolerance,
  onRemoveDifference,
  onCopyDifference,
}) => {
  const panelText = TEXT.panel;
  const panelHeadingId = useId();
  const panelInstructionsId = useId();
  return (
  <section
    aria-labelledby={panelHeadingId}
    aria-describedby={panelInstructionsId}
    tabIndex={-1}
    className="rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur"
  >
    <div id={panelHeadingId} className="mb-2 flex items-center gap-3 text-lg font-bold text-gray-800">
      <span role="img" aria-label="hint" className="text-2xl">⚡</span> {panelText.title}
    </div>
    <p id={panelInstructionsId} className="sr-only">
      {panelText.instructions}
    </p>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {differences.map((diff) => {
        const isFound = foundDifferences.includes(diff.id);
        const isSelected = selectedDifferenceId === diff.id;
        const differenceName = diff.name ?? `${panelText.emptyName} ${diff.id}`;
        const summaryId = `difference-${diff.id}-summary`;
        const shapeSelectId = `difference-${diff.id}-shape`;
        const xInputId = `difference-${diff.id}-x`;
        const yInputId = `difference-${diff.id}-y`;
        const radiusInputId = `difference-${diff.id}-radius`;
        const widthInputId = `difference-${diff.id}-width`;
        const heightInputId = `difference-${diff.id}-height`;
        const toleranceInputId = `difference-${diff.id}-tolerance`;
        return (
          <div
            key={diff.id}
            data-testid={`difference-card-${diff.id}`}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${differenceName} ${isFound ? panelText.status.found : panelText.status.pending}`}
            aria-describedby={summaryId}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectDifference(diff.id);
              }
            }}
            className={`rounded-2xl border-2 p-4 transition ${isFound ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50'} ${isSelected ? 'ring-2 ring-orange-400' : ''}`}
            onClick={() => onSelectDifference(diff.id)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {isFound ? '✓' : '?'} {differenceName}
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-400">{diff.type ?? 'circle'}</span>
            </div>
            <div id={summaryId} className="mt-2 text-xs text-gray-500">{hintShapeSummary(diff)}</div>

            {isDevMode && editMode && (
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <label className="w-16" htmlFor={shapeSelectId}>{panelText.fields.shape}</label>
                  <select
                    id={shapeSelectId}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1"
                    value={diff.type ?? 'circle'}
                    onChange={(event) => onChangeShape(diff.id, event.target.value)}
                    disabled={diff.type === 'polygon'}
                  >
                    <option value="circle">{panelText.shapes.circle}</option>
                    <option value="rect">{panelText.shapes.rect}</option>
                    {diff.type === 'polygon' && <option value="polygon">{panelText.shapes.polygon}</option>}
                  </select>
                </div>
                {diff.type === 'polygon' && (
                  <p className="rounded-lg bg-amber-50 p-2 text-[11px] text-amber-700">
                    {panelText.notices.polygon}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label className="w-10" htmlFor={xInputId}>{panelText.fields.x}</label>
                  <input
                    id={xInputId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1"
                    value={diff.x}
                    onChange={(event) => onSizeInput(diff.id, 'x', event.target.value)}
                  />
                  <label className="w-10" htmlFor={yInputId}>{panelText.fields.y}</label>
                  <input
                    id={yInputId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1"
                    value={diff.y}
                    onChange={(event) => onSizeInput(diff.id, 'y', event.target.value)}
                  />
                </div>
                {diff.type === 'circle' && (
                  <div className="flex items-center gap-2">
                    <label className="w-16" htmlFor={radiusInputId}>{panelText.fields.radius}</label>
                    <input
                      id={radiusInputId}
                      type="number"
                      min="1"
                      max="50"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-200 px-2 py-1"
                      value={diff.radius ?? 8}
                      onChange={(event) => onSizeInput(diff.id, 'radius', event.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg bg-gray-100 px-2 py-1"
                        aria-label={`Reducir radio de ${differenceName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onAdjustRadius(diff.id, -0.5);
                        }}
                      >-</button>
                      <button
                        type="button"
                        className="rounded-lg bg-gray-100 px-2 py-1"
                        aria-label={`Aumentar radio de ${differenceName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onAdjustRadius(diff.id, 0.5);
                        }}
                      >+</button>
                    </div>
                  </div>
                )}
                {diff.type === 'rect' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="w-16" htmlFor={widthInputId}>{panelText.fields.width}</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-lg bg-gray-100 px-2 py-1"
                          aria-label={`Reducir ancho de ${differenceName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdjustDimension(diff.id, 'width', -0.5);
                          }}
                        >-</button>
                        <input
                          id={widthInputId}
                          type="number"
                          min="2"
                          max="100"
                          step="0.1"
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1"
                          value={diff.width ?? 12}
                          onChange={(event) => onSizeInput(diff.id, 'width', event.target.value)}
                        />
                        <button
                          type="button"
                          className="rounded-lg bg-gray-100 px-2 py-1"
                          aria-label={`Aumentar ancho de ${differenceName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdjustDimension(diff.id, 'width', 0.5);
                          }}
                        >+</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-16" htmlFor={heightInputId}>{panelText.fields.height}</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-lg bg-gray-100 px-2 py-1"
                          aria-label={`Reducir alto de ${differenceName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdjustDimension(diff.id, 'height', -0.5);
                          }}
                        >-</button>
                        <input
                          id={heightInputId}
                          type="number"
                          min="2"
                          max="100"
                          step="0.1"
                          className="w-20 rounded-lg border border-gray-200 px-2 py-1"
                          value={diff.height ?? 12}
                          onChange={(event) => onSizeInput(diff.id, 'height', event.target.value)}
                        />
                        <button
                          type="button"
                          className="rounded-lg bg-gray-100 px-2 py-1"
                          aria-label={`Aumentar alto de ${differenceName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAdjustDimension(diff.id, 'height', 0.5);
                          }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="w-16" htmlFor={toleranceInputId}>{panelText.fields.tolerance}</label>
                  <input
                    id={toleranceInputId}
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1"
                    value={diff.tolerance ?? 0}
                    onChange={(event) => onSizeInput(diff.id, 'tolerance', event.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg bg-gray-100 px-2 py-1"
                      aria-label={`Reducir tolerancia de ${differenceName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAdjustTolerance(diff.id, -0.5);
                      }}
                    >-</button>
                    <button
                      type="button"
                      className="rounded-lg bg-gray-100 px-2 py-1"
                      aria-label={`Aumentar tolerancia de ${differenceName}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAdjustTolerance(diff.id, 0.5);
                      }}
                    >+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveDifference(diff.id);
                    }}
                    className="rounded-lg bg-rose-100 px-3 py-1 font-semibold text-rose-600 hover:bg-rose-200"
                  >
                    {panelText.actions.remove}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCopyDifference(diff);
                    }}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-gray-600 hover:bg-gray-200"
                  >
                    {panelText.actions.copy}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </section>
  );
};

DifferencesPanel.propTypes = {
  differences: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
  })).isRequired,
  foundDifferences: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedDifferenceId: PropTypes.number,
  onSelectDifference: PropTypes.func.isRequired,
  hintShapeSummary: PropTypes.func.isRequired,
  isDevMode: PropTypes.bool,
  editMode: PropTypes.bool,
  onChangeShape: PropTypes.func,
  onSizeInput: PropTypes.func,
  onAdjustRadius: PropTypes.func,
  onAdjustDimension: PropTypes.func,
  onAdjustTolerance: PropTypes.func,
  onRemoveDifference: PropTypes.func,
  onCopyDifference: PropTypes.func,
};

export default DifferencesPanel;
