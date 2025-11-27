import { useCallback } from 'react';

/**
 * Hook personalizado para gestionar la importación y exportación de niveles.
 * Permite copiar configuración al portapapeles y cargar desde archivos JSON.
 */
const useLevelImportExport = () => {
    const exportLevel = useCallback(async (levelData, differences) => {
        const payload = JSON.stringify({
            ...(levelData ?? {}),
            differences,
        }, null, 2);
        try {
            await navigator.clipboard.writeText(payload);
            alert('Configuración copiada al portapapeles.');
        } catch (err) {
            console.error(err);
            alert('No se pudo copiar al portapapeles. Revisa la consola.');
        }
    }, []);

    const importLevel = useCallback((event, setDifferences, overrideLevelData) => {
        const [file] = event.target.files ?? [];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const payload = JSON.parse(loadEvent.target?.result ?? '{}');
                if (!Array.isArray(payload.differences)) throw new Error('El JSON debe incluir un arreglo "differences".');
                setDifferences(payload.differences);
                overrideLevelData(prev => ({ ...prev, ...payload }));
            } catch (err) {
                console.error(err);
                alert('No se pudo importar el archivo. Comprueba que tenga el formato correcto.');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }, []);

    const handleCopyDifference = useCallback((diff) => {
        navigator.clipboard?.writeText(JSON.stringify(diff, null, 2));
    }, []);

    return {
        exportLevel,
        importLevel,
        handleCopyDifference,
    };
};

export default useLevelImportExport;
