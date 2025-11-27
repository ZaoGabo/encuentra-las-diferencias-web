import React from 'react';
import PropTypes from 'prop-types';
import { HitMarker, WrongMarker } from './FeedbackMarker';
import EditOverlays from './EditOverlays';
import EditMarkers from './EditMarkers';

/**
 * Componente contenedor que agrupa todos los overlays de juego y edición.
 * Simplifica el renderizado en el componente principal.
 */
const GameOverlays = ({
    imageType,
    editMode,
    isDevMode,
    differences,
    foundDifferences,
    wrongClick,
    selectedDifferenceId,
    onSelectDifference,
    onPointerDown,
}) => {
    return (
        <>
            {/* Hit Markers */}
            {foundDifferences.map(diffId => {
                const diff = differences.find(item => item.id === diffId);
                if (!diff) return null;
                return <HitMarker key={`hit-${imageType}-${diffId}`} x={diff.x} y={diff.y} />;
            })}

            {/* Wrong Marker */}
            {wrongClick && wrongClick.context?.imageType === imageType && (
                <WrongMarker x={wrongClick.x} y={wrongClick.y} />
            )}

            {/* Edit Overlays */}
            {isDevMode && editMode && (
                <>
                    <EditOverlays
                        differences={differences}
                        imageType={imageType}
                    />
                    <EditMarkers
                        differences={differences}
                        imageType={imageType}
                        selectedDifferenceId={selectedDifferenceId}
                        onSelectDifference={onSelectDifference}
                        onPointerDown={onPointerDown}
                    />
                </>
            )}
        </>
    );
};

GameOverlays.propTypes = {
    imageType: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    isDevMode: PropTypes.bool.isRequired,
    differences: PropTypes.arrayOf(PropTypes.object).isRequired,
    foundDifferences: PropTypes.arrayOf(PropTypes.number).isRequired,
    wrongClick: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        context: PropTypes.object,
    }),
    selectedDifferenceId: PropTypes.number,
    onSelectDifference: PropTypes.func.isRequired,
    onPointerDown: PropTypes.func.isRequired,
};

export default GameOverlays;
