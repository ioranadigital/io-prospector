// backend/services/prospection-state.service.js
// Maneja el estado de prospecciones en progress

const prospections = new Map(); // id → { status, progress, result, error }

export const prospectionStateService = {
  // Crear nueva prospección
  create(id, params) {
    prospections.set(id, {
      id,
      status: 'starting',
      progress: 0,
      params,
      startedAt: new Date(),
      result: null,
      error: null,
    });
    return prospections.get(id);
  },

  // Obtener estado
  get(id) {
    return prospections.get(id) || null;
  },

  // Actualizar progreso
  updateProgress(id, progress) {
    const p = prospections.get(id);
    if (p) {
      p.progress = progress;
      p.updatedAt = new Date();
    }
    return p;
  },

  // Marcar como completado
  complete(id, result) {
    const p = prospections.get(id);
    if (p) {
      p.status = 'completed';
      p.progress = 100;
      p.result = result;
      p.completedAt = new Date();
    }
    return p;
  },

  // Marcar como error
  error(id, errorMsg) {
    const p = prospections.get(id);
    if (p) {
      p.status = 'error';
      p.error = errorMsg;
      p.completedAt = new Date();
    }
    return p;
  },

  // Obtener historial (últimas N)
  getHistory(limit = 10) {
    return Array.from(prospections.values())
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
      .slice(0, limit);
  },

  // Limpiar
  clear(id) {
    prospections.delete(id);
  },
};

export default prospectionStateService;
