import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Star, RefreshCw, Zap, Upload, Download, Clock3 } from 'lucide-react';
import LevelSelector from './LevelSelector';
import { TEXT } from '../config/textContent';

const GameHeader = ({
  levelName = null,
  levels,
  currentLevelId = '',
  onSelectLevel,
  loadingLevel = false,
  score,
  foundDifferencesCount,
  totalDifferences,
  formattedTime,
  timeLeft,
  gameStarted,
  onResetGame,
  isDevMode = false,
  editMode = false,
  onToggleEditMode,
  onExportLevel,
  onImportLevel,
}) => {
  const importInputRef = useRef(null);
  const foundSummary = `${foundDifferencesCount}/${totalDifferences}`;
  const headerText = TEXT.header;

  return (
    <div className="rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-bold">
            <Star className="h-10 w-10 text-yellow-500" />
            {headerText.title}
          </h1>
          <p className="mt-2 text-gray-600">
            {levelName ?? headerText.levelPlaceholder}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <LevelSelector
            levels={levels}
            currentLevelId={currentLevelId}
            onSelect={onSelectLevel}
            disabled={loadingLevel}
          />

          <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 px-5 py-3 text-center">
            <div className="text-3xl font-bold text-purple-600">{score}</div>
            <div className="text-xs font-semibold text-purple-500">{headerText.metrics.points}</div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 px-5 py-3 text-center">
            <div className="text-3xl font-bold text-blue-600">{foundSummary}</div>
            <div className="text-xs font-semibold text-blue-500">{headerText.metrics.found}</div>
          </div>

          <div className={`rounded-2xl px-5 py-3 text-center ${timeLeft < 30 && gameStarted ? 'bg-rose-100 animate-pulse' : 'bg-gradient-to-br from-emerald-100 to-lime-100'}`}>
            <div className={`text-3xl font-bold ${timeLeft < 30 && gameStarted ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formattedTime}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600">
              <Clock3 className="h-4 w-4" /> {headerText.metrics.time}
            </div>
          </div>

          <button
            onClick={onResetGame}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            <RefreshCw size={18} /> {headerText.buttons.restart}
          </button>

          {isDevMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleEditMode}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${editMode ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                title={headerText.tooltips.toggleEdit}
              >
                <Zap size={18} /> {editMode ? headerText.buttons.editEnabled : headerText.buttons.editMode}
              </button>

              <button
                onClick={onExportLevel}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200"
              >
                <Download size={18} /> {headerText.buttons.export}
              </button>

              <button
                onClick={() => importInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200"
              >
                <Upload size={18} /> {headerText.buttons.import}
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImportLevel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

GameHeader.propTypes = {
  levelName: PropTypes.string,
  levels: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentLevelId: PropTypes.string,
  onSelectLevel: PropTypes.func.isRequired,
  loadingLevel: PropTypes.bool,
  score: PropTypes.number.isRequired,
  foundDifferencesCount: PropTypes.number.isRequired,
  totalDifferences: PropTypes.number.isRequired,
  formattedTime: PropTypes.string.isRequired,
  timeLeft: PropTypes.number.isRequired,
  gameStarted: PropTypes.bool.isRequired,
  onResetGame: PropTypes.func.isRequired,
  isDevMode: PropTypes.bool,
  editMode: PropTypes.bool,
  onToggleEditMode: PropTypes.func,
  onExportLevel: PropTypes.func,
  onImportLevel: PropTypes.func,
};

export default GameHeader;
