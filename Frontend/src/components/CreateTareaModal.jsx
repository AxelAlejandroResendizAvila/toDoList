import { useState, useEffect } from 'react';
import { useTareas } from '../hooks/useTareas';

export default function CreateTareaModal({ seccion, onClose }) {
  const { createTarea, getColaboradores } = useTareas();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState(2);
  const [fechaLimite, setFechaLimite] = useState('');
  const [colaboradores, setColaboradores] = useState([]);
  const [correosAsignados, setCorreosAsignados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getColaboradores(seccion.id).then(setColaboradores).catch(console.error);
  }, [getColaboradores, seccion.id]);

  const toggleAsignacion = (correo) => {
    setCorreosAsignados(prev => 
      prev.includes(correo) ? prev.filter(c => c !== correo) : [...prev, correo]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await createTarea({
        nombre,
        descripcion,
        prioridad: Number(prioridad),
        estatus: 'PENDIENTE',
        fechaLimite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
        seccion: { id: seccion.id },
        correosAsignados,
      });
      onClose();
    } catch (err) {
      console.error('Error al crear tarea:', err);
    } finally {
      setLoading(false);
    }
  };

  const prioridades = [
    { valor: 1, label: '🔴 Alta', color: 'text-red-600 bg-red-50 border-red-200' },
    { valor: 2, label: '🟡 Media', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { valor: 3, label: '🟢 Baja', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Nueva Tarea</h2>
              <p className="text-indigo-100 text-sm mt-1">en <span className="font-semibold">{seccion.nombre}</span></p>
            </div>
            <button onClick={onClose} className="text-white hover:text-indigo-200 transition-colors mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nombre de la Tarea <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
              placeholder="¿Qué hay que hacer?"
              autoFocus
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Descripción <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white resize-none"
              placeholder="Agrega más detalles..."
              rows={3}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {prioridades.map((p) => (
                <button
                  key={p.valor}
                  type="button"
                  onClick={() => setPrioridad(p.valor)}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    prioridad === p.valor
                      ? p.color + ' border-current shadow-sm scale-105'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Fecha límite <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Asignar (NUEVO) */}
          {colaboradores.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Asignar a:</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {colaboradores.map((colab) => (
                  <button
                    key={colab.id}
                    type="button"
                    onClick={() => toggleAsignacion(colab.usuario.correo)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      correosAsignados.includes(colab.usuario.correo)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {correosAsignados.includes(colab.usuario.correo) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {colab.usuario.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
