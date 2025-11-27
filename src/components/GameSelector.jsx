import React from 'react';
import PropTypes from 'prop-types';
import { Star, Circle, Triangle } from 'lucide-react';

/**
 * Componente de selección de juegos estilo Arcade
 * Muestra una pantalla de bienvenida con múltiples juegos disponibles
 */
const GameSelector = ({ onSelectGame }) => {
    const games = [
        {
            id: 'find-differences',
            title: 'Encuentra las Diferencias',
            description: 'Busca las diferencias entre dos imágenes antes de que se acabe el tiempo.',
            status: 'available',
            buttonText: '¡Jugar!',
            bgColor: 'from-purple-400 to-pink-400',
            buttonColor: 'bg-pink-500 hover:bg-pink-600',
            icon: '🔍',
        },
        {
            id: 'memory',
            title: 'Memoria',
            description: 'Empareja cartas iguales. Juego próximamente.',
            status: 'coming-soon',
            buttonText: 'Próximamente',
            bgColor: 'from-cyan-400 to-blue-400',
            buttonColor: 'bg-blue-400 hover:bg-blue-500',
            icon: '🧠',
        },
        {
            id: 'time-challenge',
            title: 'Crono-Reto',
            description: 'Mini-retos contra el tiempo. Próximamente.',
            status: 'coming-soon',
            buttonText: 'Próximamente',
            bgColor: 'from-yellow-400 to-orange-400',
            buttonColor: 'bg-orange-400 hover:bg-orange-500',
            icon: '⏱️',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-200 to-cyan-200 relative overflow-hidden">
            {/* Formas decorativas de fondo */}
            <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-300 rounded-full opacity-40 animate-pulse" />
            <div className="absolute top-40 right-20 w-16 h-16 rotate-45 opacity-30">
                <div className="w-full h-full border-4 border-pink-300" />
            </div>
            <div className="absolute bottom-20 left-1/4 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-green-300 opacity-30" />
            <Circle className="absolute top-1/2 right-10 w-24 h-24 text-purple-300 opacity-20" />
            <Triangle className="absolute bottom-10 right-1/3 w-16 h-16 text-green-300 opacity-30" />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    {/* Sección principal */}
                    <div>
                        {/* Encabezado */}
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-4 flex items-center gap-3 flex-wrap">
                                ¡Bienvenido a Arcade!
                                <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" />
                            </h1>
                            <p className="text-lg text-slate-700">
                                Elige un juego y compite contra el reloj. Diviértete y mejora tu puntuación.
                            </p>
                        </div>

                        {/* Título de sección */}
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">
                            Selecciona tu juego
                        </h2>

                        {/* Grid de juegos */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {games.map((game) => (
                                <div
                                    key={game.id}
                                    className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300"
                                >
                                    {/* Tarjeta de juego con gradient */}
                                    <div className={`bg-gradient-to-br ${game.bgColor} p-6 text-center relative`}>
                                        {/* Icono grande del juego */}
                                        <div className="text-8xl mb-4 filter drop-shadow-lg">
                                            {game.icon}
                                        </div>

                                        {/* Título del juego */}
                                        <h3 className="text-2xl font-black text-white mb-4 drop-shadow-md">
                                            {game.title}
                                        </h3>

                                        {/* Botón de acción */}
                                        <button
                                            onClick={() => game.status === 'available' && onSelectGame(game.id)}
                                            disabled={game.status === 'coming-soon'}
                                            className={`
                        ${game.buttonColor}
                        text-white font-bold py-3 px-8 rounded-full text-lg
                        shadow-lg transform transition-all duration-200
                        ${game.status === 'available'
                                                    ? 'hover:scale-110 cursor-pointer active:scale-95'
                                                    : 'opacity-70 cursor-not-allowed'}
                      `}
                                        >
                                            {game.buttonText}
                                        </button>
                                    </div>

                                    {/* Descripción */}
                                    <div className="p-4 bg-amber-50/80">
                                        <p className="text-sm text-slate-700 text-center">
                                            {game.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel lateral - Acerca de este juego */}
                    <div className="bg-amber-50 rounded-3xl shadow-2xl p-8 h-fit sticky top-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">
                            Acerca de este juego
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">
                                    Encuentra las Diferencias
                                </h3>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>
                                            Busca las diferencias entre dos imágenes antes de que se acabe el tiempo.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>
                                            Busca las diferencias entre las imágenes e oomarsantes para ganar puntos.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>
                                            Encuentra las diferencias para dar que la orecor encuentre las diferencias.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>
                                            Resova encuentra las diferencias para corroír tu pensumeente.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => onSelectGame('find-differences')}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-bold py-4 px-6 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 mt-6"
                            >
                                Entrar al sitio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

GameSelector.propTypes = {
    onSelectGame: PropTypes.func.isRequired,
};

export default React.memo(GameSelector);
