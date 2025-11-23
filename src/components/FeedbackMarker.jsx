import React from 'react';
import PropTypes from 'prop-types';

export const WrongMarker = ({ x, y }) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)'
    }}
  >
    <span className="relative block w-14 h-14">
      <span className="absolute inset-0 rounded-full border-2 border-rose-500/70 animate-[ping_1s_ease-out]" />
      <span className="absolute inset-[6px] rounded-full bg-rose-500/20 backdrop-blur-sm flex items-center justify-center text-rose-600 font-bold text-xl">
        ✗
      </span>
    </span>
  </div>
);

WrongMarker.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export const HitMarker = ({ x, y }) => (
  <div
    className="absolute pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)'
    }}
  >
    <span className="relative block w-16 h-16">
      <span className="absolute inset-0 rounded-full border-4 border-emerald-400/80 animate-[ping_1.2s_ease-out]" />
      <span className="absolute inset-[6px] rounded-full bg-emerald-400/30 backdrop-blur-sm flex items-center justify-center text-emerald-600 font-bold text-2xl">
        ✔
      </span>
    </span>
  </div>
);

HitMarker.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export default { WrongMarker, HitMarker };
