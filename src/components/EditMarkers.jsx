import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que renderiza los marcadores numéricos de edición.
 * Permite seleccionar y arrastrar diferencias en el modo edición.
 */
const EditMarkers = ({
    differences,
    imageType,
    selectedDifferenceId,
    onSelectDifference,
    onPointerDown,
}) => {
    if (!differences || differences.length === 0) return null;

    return (
        <>
            {differences.map(diff => (
                <button
                    key={`edit-${imageType}-${diff.id}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onSelectDifference(diff.id);
                    }}
                    onPointerDown={(event) => onPointerDown(event, diff.id, imageType)}
                    className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold ${selectedDifferenceId === diff.id ? 'border-orange-500 bg-orange-500/30 text-white' : 'border-orange-300 bg-orange-200/40 text-orange-700'}`}
                    style={{ left: `${diff.x}%`, top: `${diff.y}%` }}
                    title={`Editar ${diff.name ?? `Marcador ${diff.id}`}`}
                >
                    {diff.id}
                </button>
            ))}
        </>
    );
};

EditMarkers.propTypes = {
    differences: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        name: PropTypes.string,
    })).isRequired,
    imageType: PropTypes.string.isRequired,
    selectedDifferenceId: PropTypes.number,
    onSelectDifference: PropTypes.func.isRequired,
    onPointerDown: PropTypes.func.isRequired,
};

export default EditMarkers;
