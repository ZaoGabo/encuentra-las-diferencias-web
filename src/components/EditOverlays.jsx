import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que renderiza los overlays visuales para el modo edición.
 * Muestra las áreas de las diferencias con sus tolerancias.
 */
const EditOverlays = ({ differences, imageType }) => {
    if (!differences || differences.length === 0) return null;

    return (
        <>
            {differences.map(diff => {
                const tolerance = diff.tolerance ?? 0;

                if (diff.type === 'rect') {
                    const width = diff.width ?? 10;
                    const height = diff.height ?? 10;
                    const effectiveWidth = width + tolerance * 2;
                    const effectiveHeight = height + tolerance * 2;
                    return (
                        <React.Fragment key={`overlay-${imageType}-${diff.id}`}>
                            <div
                                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-orange-400/70"
                                style={{
                                    left: `${diff.x}%`,
                                    top: `${diff.y}%`,
                                    width: `${effectiveWidth}%`,
                                    height: `${effectiveHeight}%`
                                }}
                            />
                            <div
                                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border border-orange-400/40 border-dashed"
                                style={{
                                    left: `${diff.x}%`,
                                    top: `${diff.y}%`,
                                    width: `${width}%`,
                                    height: `${height}%`
                                }}
                            />
                        </React.Fragment>
                    );
                }

                if (diff.type === 'polygon') {
                    return null;
                }

                const radius = diff.radius ?? 8;
                const effectiveRadius = radius + tolerance;
                return (
                    <React.Fragment key={`overlay-${imageType}-${diff.id}`}>
                        <div
                            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400/70"
                            style={{
                                left: `${diff.x}%`,
                                top: `${diff.y}%`,
                                width: `${effectiveRadius * 2}%`,
                                height: `${effectiveRadius * 2}%`
                            }}
                        />
                        <div
                            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/40 border-dashed"
                            style={{
                                left: `${diff.x}%`,
                                top: `${diff.y}%`,
                                width: `${radius * 2}%`,
                                height: `${radius * 2}%`
                            }}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};

EditOverlays.propTypes = {
    differences: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        radius: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        tolerance: PropTypes.number,
        points: PropTypes.array,
    })).isRequired,
    imageType: PropTypes.string.isRequired,
};

export default EditOverlays;
