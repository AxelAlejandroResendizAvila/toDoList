import { useState, useEffect } from 'react';
import { useTareas } from '../hooks/useTareas';

export default function ColaboradoresModal({ seccion, onClose, onOpenProfile }) {
  const { getColaboradores, cambiarRol } = useTareas();
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const loadColaboradores = async () => {
    try {
      const data = await getColaboradores(seccion.id);
      setColaboradores(data);
    } catch (err) {
      setMsg({ text: 'Error al cargar colaboradores', type: 'error' });
    }
  };

  useEffect(() => {
    loadColaboradores();
  }, [seccion.id]);

  const handleCambiarRol = async (colabId, nuevoRol) => {
    try {
      await cambiarRol(seccion.id, colabId, nuevoRol);
      setMsg({ text: 'Rol actualizado', type: 'success' });
      loadColaboradores();
    } catch (err) {
      setMsg({ text: 'Error al actualizar rol', type: 'error' });
    }
  };

  const isAdmin = seccion.rol === 'ADMIN';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Colaboradores</h2>
            <p className="text-indigo-100 text-sm">{seccion.nombre}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-indigo-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {msg.text && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
              msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {msg.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              )}
              {msg.text}
            </div>
          )}

          {/* Lista de colaboradores */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Colaboradores Actuales
            </h3>
            <div className="space-y-3">
              {colaboradores.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onOpenProfile && onOpenProfile(c.usuario?.id)}
                      className="h-10 w-10 flex-shrink-0 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full font-bold text-lg hover:scale-110 transition-transform cursor-pointer leading-none"
                      title="Ver perfil"
                    >
                      <span className="mb-[1px]">{c.usuario?.nombre?.charAt(0).toUpperCase() || '?'}</span>
                    </button>
                    <div>
                      <p className="font-bold text-gray-800">{c.usuario?.nombre}</p>
                      <p className="text-sm text-gray-500">{c.usuario?.correo}</p>
                    </div>
                  </div>
                  
                  {isAdmin ? (
                    <select
                      value={c.rol}
                      onChange={(e) => handleCambiarRol(c.id, e.target.value)}
                      className={`text-sm font-semibold rounded-full px-4 py-1 border transition-colors ${
                        c.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        c.rol === 'EDITOR' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      } cursor-pointer hover:bg-opacity-80`}
                    >
                      <option value="LECTOR">LECTOR</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      c.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      c.rol === 'EDITOR' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {c.rol}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
