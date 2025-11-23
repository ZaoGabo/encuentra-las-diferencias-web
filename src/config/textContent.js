export const TEXT = {
  header: {
    title: 'Encuentra las Diferencias',
    levelPlaceholder: 'Selecciona un nivel para comenzar',
    metrics: {
      points: 'Puntos',
      found: 'Encontradas',
      time: 'Tiempo',
    },
    buttons: {
      restart: 'Reiniciar',
      editMode: 'Modo edición',
      editEnabled: 'Edición activada',
      export: 'Exportar',
      import: 'Importar',
    },
    tooltips: {
      toggleEdit: 'Alternar modo edición',
    },
  },
  canvas: {
    original: {
      title: '🖼️ Imagen Original',
      fallbackDescription: 'Asegúrate de que la ruta "originalImage" apunte a un archivo válido.',
    },
    modified: {
      title: '🔍 Imagen Modificada',
      fallbackDescription: 'Asegúrate de que la ruta "modifiedImage" apunte a un archivo válido.',
    },
    fallbackTitle: 'Imagen no disponible',
  },
  panel: {
    title: 'Pistas de las diferencias',
    instructions: 'Usa las tarjetas para resaltar o editar cada diferencia. Presiona Enter o la barra espaciadora para seleccionarlas.',
    fields: {
      shape: 'Forma',
      x: 'X',
      y: 'Y',
      radius: 'Radio',
      width: 'Ancho',
      height: 'Alto',
      tolerance: 'Tol.',
    },
    status: {
      found: 'encontrada',
      pending: 'pendiente',
    },
    shapes: {
      circle: 'Círculo',
      rect: 'Rectángulo',
      polygon: 'Polígono',
    },
    notices: {
      polygon: 'Esta diferencia es un polígono personalizado. Ajusta sus puntos en el JSON si necesitas modificar la forma.',
    },
    actions: {
      remove: 'Eliminar',
      copy: 'Copiar JSON',
    },
    emptyName: 'Diferencia',
  },
  scoreboard: {
    title: 'Progreso',
    accuracy: 'Precisión',
    attempts: 'Intentos',
    score: 'Puntuación',
    remainingTime: 'Tiempo restante',
  },
  callToAction: {
    title: '¿Listo para jugar?',
    description: 'Presiona el botón para iniciar el reto.',
    button: '¡Comenzar!',
  },
  modals: {
    loadError: {
      title: 'Error al cargar',
      retry: 'Reintentar carga',
    },
    victory: {
      title: '¡Nivel completado!',
      replay: 'Jugar de nuevo',
      next: 'Siguiente nivel',
    },
    timeout: {
      title: 'Tiempo agotado',
      description: '¡Casi lo logras! Revisa las pistas o intenta nuevamente.',
      viewHints: 'Ver pistas',
      retry: 'Intentar de nuevo',
      tip: 'Consejo: busca elementos que cambian ligeramente de color o posición.',
    },
  },
};
