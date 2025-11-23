# Encuentra las Diferencias

**Estado:**  *En desarrollo* (recién comenzado)

Este proyecto es una aplicación web tipo juego donde el objetivo es encontrar diferencias entre dos imágenes. Está construido con React y Vite, y permite agregar niveles, ajustar dificultad y visualizar marcadores de diferencias (solo en modo desarrollador).

Características principales:
- Pantalla de bienvenida
- Sistema de puntuación y temporizador
- Niveles configurables
- Edición de diferencias solo para el autor
- Hooks reutilizables para niveles, diferencias y cuenta regresiva
- Componentes tipados con PropTypes y pruebas unitarias con Vitest
- Textos y mensajes centralizados en `src/config/textContent.js`
- Persistencia de diferencias en modo edición con utilidades seguras de `localStorage`
- Panel de pistas y selector de niveles con mejoras de accesibilidad (atributos ARIA y manejo de foco)

Ideal para practicar observación y atención visual.

## Requisitos

- Node.js 18 o superior
- npm (viene incluido con Node.js)


## ¿Cómo probar la aplicación?

1. Instala Node.js (versión 18 o superior).
2. Descarga este proyecto y abre una terminal en la carpeta principal.
3. Ejecuta:
	```bash
	npm install
	npm run dev
	```
4. Abre la URL que aparece en la terminal (por defecto http://localhost:5173) en tu navegador.

¡Listo! Ya puedes jugar Encuentra las Diferencias en tu computadora.

Próximamente se publicará un link para jugar online directamente.

### Scripts disponibles

```bash
npm run dev      # Levanta el entorno de desarrollo
npm run build    # Genera la versión lista para producción
npm run preview  # Sirve el build para revisión local
npm test         # Ejecuta las pruebas unitarias con Vitest
```

## Personalización de imágenes

Coloca tus imágenes en `public/images` con los nombres `original.png` y `modified.png`. El componente usa rutas relativas (`/images/original.png`, `/images/modified.png`).

## Notas técnicas

- Tailwind se importa mediante CDN desde `index.html` para simplificar el prototipo; se puede migrar a una configuración completa si hace falta.
- El modo edición de diferencias sólo se muestra cuando la app se ejecuta en modo desarrollo (`npm run dev`).
- El contenido textual de toda la interfaz vive en `src/config/textContent.js` para evitar cadenas quemadas y facilitar traducciones.
- El helper `src/utils/storage.js` cachea lecturas/escrituras de `localStorage` y evita operaciones redundantes durante el modo edición.
- El archivo `vite.config.js` contiene la configuración de Vite. Si más adelante despliegas en un subdirectorio, ajusta `base` según sea necesario.
- El estado del juego se maneja con hooks específicos (`useLevels`, `useDifferences`, `useCountdown`) para aislar responsabilidades y facilitar pruebas.
- Las utilidades compartidas (`src/utils/gameUtils.js`) centralizan funciones comunes como `clampPercent` y formateo de tiempo.
- Se añadieron pruebas unitarias para los hooks y utilidades principales; puedes extenderlas según agregues nuevas reglas.

### Modo edición y almacenamiento local

Cuando el juego corre en modo desarrollador puedes activar la edición para mover, agrandar o duplicar diferencias directamente sobre las imágenes. Los cambios se guardan temporalmente usando `localStorage` (clave `differences-<levelId>`) mediante funciones resilientes y con escrituras debounced, lo que evita saturar el navegador. Desde el header puedes exportar o importar la configuración actual para compartir nuevos niveles.

### Accesibilidad y foco

- El selector de niveles anuncia la dificultad activa mediante `aria-live`, y todas las etiquetas están asociadas correctamente a sus controles.
- El panel de pistas funciona como una región navegable con instrucciones ocultas para lectores de pantalla y cada tarjeta expone su estado (pendiente/encontrada) mediante `aria-label`.
- Los controles de ajuste en modo edición detienen la propagación de eventos y tienen descripciones habladas, lo que facilita el uso con teclado.

## Buenas prácticas incorporadas

- **Hooks reutilizables** (`useLevels`, `useCountdown`, `useDifferences`) para separar la lógica de negocio del renderizado.
- **Utilidades puras** en `src/utils/gameUtils.js` para evitar duplicar helpers y facilitar su testeo.
- **PropTypes** en componentes clave para detectar contratos inválidos durante el desarrollo.
- **Configuración de pruebas con Vitest + Testing Library**, que cubre la lógica de puntuación y registro de diferencias.
- **Plugin oficial de React para Vite**, lo que mejora el soporte de JSX y las comprobaciones en caliente.
- **Utilidades de almacenamiento testeadas** para asegurar que la edición local funcione incluso si `localStorage` falla.

## Pruebas automatizadas

Ejecuta la suite unitaria con Vitest:

```bash
npm run test
```

Esto levanta el entorno `jsdom`, aplica los matchers de `@testing-library/jest-dom` y muestra la cobertura básica de la lógica del juego.
