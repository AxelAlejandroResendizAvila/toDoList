import { useState } from 'react';
import { useTareas } from '../hooks/useTareas';

export default function CreateSeccionModal({ onClose }) {
  const { createSeccion } = useTareas();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempoMinutos, setTiempoMinutos] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await createSeccion({
        nombre,
        descripcion,
        tiempoAsignadoMinutos: tiempoMinutos,
        rol: 'ADMIN'
      });
      onClose();
    } catch (err) {
      console.error('Error al crear sección:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">Nueva Sección</h2>
          <button onClick={onClose} className="text-white hover:text-indigo-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Nombre de la Sección
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ej: Proyecto Backend, Compras, Gimnasio..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="¿De qué trata este espacio?"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
              Tiempo Sugerido (minutos)
              <span className="text-gray-400 font-normal text-sm" title="Tiempo estimado para completar tareas en esta sección">(?)</span>
            </label>
            <input
              type="number"
              min="1"
              value={tiempoMinutos}
              onChange={(e) => setTiempoMinutos(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Sección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
