import { useState, useEffect } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useAuth } from '../hooks/useAuth';
import ColaboradoresModal from './ColaboradoresModal';
import CreateSeccionModal from './CreateSeccionModal';
import UserProfileModal from './UserProfileModal';

function SeccionCard({ seccion, onSelect, onOpenColabs, onDelete, getCodigoInvitacion, regenerarCodigoInvitacion, onOpenProfile }) {
  const [showCode, setShowCode] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleToggleCode = async (e) => {
    e.stopPropagation();
    if (!showCode && !codigo) {
      setLoadingCode(true);
      try {
        const data = await getCodigoInvitacion(seccion.id);
        setCodigo(data.codigo);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCode(false);
      }
    }
    setShowCode(!showCode);
  };

  const handleRegenerate = async (e) => {
    e.stopPropagation();
    if (!confirm('¿Regenerar el código? El código actual dejará de funcionar inmediatamente.')) return;
    setRegenerating(true);
    try {
      const data = await regenerarCodigoInvitacion(seccion.id);
      setCodigo(data.codigo);
      setCopied(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(seccion)}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col cursor-pointer hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="p-6 flex flex-col gap-4 flex-1 relative z-10">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border tracking-widest uppercase ${
            seccion.rol === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
            seccion.rol === 'EDITOR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
            'bg-slate-50 text-slate-500 border-slate-100'
          }`}>
            {seccion.rol}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-900 transition-colors">
            {seccion.nombre}
          </h3>
          {seccion.descripcion && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
              {seccion.descripcion}
            </p>
          )}
          <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{seccion.tiempoAsignadoMinutos} min sugeridos</span>
          </div>
        </div>

        {/* Código de invitación (Solo para ADMIN y EDITOR) */}
        {seccion.rol !== 'LECTOR' && (
          <div className="border-t border-slate-50 pt-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleToggleCode}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCode
                  ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                } />
              </svg>
              {loadingCode ? 'Generando...' : showCode ? 'Ocultar código' : 'Mostrar código de invitación'}
            </button>

            {showCode && codigo && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-indigo-50 text-indigo-700 text-[10px] font-mono px-3 py-2 rounded-lg border border-indigo-100 truncate font-bold">
                    {codigo}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-3 py-2 rounded-lg transition-all ${
                      copied
                        ? 'bg-emerald-100 text-emerald-700 font-bold'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-rose-500 font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Expira en 30 min
                  </span>
                  <button 
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="text-[9px] text-slate-400 hover:text-indigo-600 font-bold underline transition-colors"
                  >
                    {regenerating ? 'Regenerando...' : 'Regenerar código'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Colaboradores */}
        {seccion.colaboradores && seccion.colaboradores.length > 0 && (
          <div className="mt-2 pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Equipo
            </p>
            <div className="flex flex-wrap gap-2">
              {seccion.colaboradores.map((colab, idx) => (
                <button 
                  key={idx} 
                  onClick={(e) => { e.stopPropagation(); onOpenProfile && onOpenProfile(colab.id); }}
                  className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer group/colab"
                  title={`${colab.nombre} - ${colab.rol} (Clic para ver perfil)`}
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold group-hover/colab:bg-indigo-600 group-hover/colab:text-white transition-colors leading-none">
                    <span className="mb-[1px]">{colab.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-600 truncate max-w-[60px]">
                    {colab.nombre}
                  </span>
                  <span className={`text-[7px] font-bold px-1 rounded ${
                    colab.rol === 'ADMIN' ? 'text-purple-600 bg-purple-50' :
                    colab.rol === 'EDITOR' ? 'text-blue-600 bg-blue-50' :
                    'text-slate-500 bg-slate-100'
                  }`}>
                    {colab.rol}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer de la tarjeta */}
      <div className="px-6 pb-5 flex justify-between items-center relative z-10">
        <span className="text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
          Abrir <span className="text-lg">→</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenColabs(seccion, e); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            title="Gestionar colaboradores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 00-7 7v1h11v-1a7 7 0 00-7-7z" />
            </svg>
          </button>

          {seccion.rol === 'ADMIN' && (
            <button
              onClick={(e) => onDelete(seccion.id, e)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
              title="Eliminar sección"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeccionList({ onSelectSeccion }) {
  const { user } = useAuth();
  const {
    secciones,
    loading,
    error,
    fetchSecciones,
    deleteSeccion,
    aceptarInvitacion,
    getCodigoInvitacion,
    regenerarCodigoInvitacion,
  } = useTareas();

  const [seccionParaColabs, setSeccionParaColabs] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tokenInvitacion, setTokenInvitacion] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    if (user) fetchSecciones();
  }, [fetchSecciones, user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta sección? Esto borrará todas sus tareas.')) {
      try {
        await deleteSeccion(id);
      } catch (err) {
        console.error('Error al eliminar sección:', err);
      }
    }
  };

  const handleJoinSeccion = async (e) => {
    e.preventDefault();
    if (!tokenInvitacion.trim()) return;
    try {
      await aceptarInvitacion(tokenInvitacion.trim());
      setTokenInvitacion('');
      setShowInviteInput(false);
    } catch (err) {
      alert('Error al unirse: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tus Espacios</h1>
            <p className="text-slate-500 text-sm mt-1">Organiza tus tareas por secciones y colabora con otros.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteInput(!showInviteInput)}
              className="px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Unirse con código
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nueva Sección
            </button>
          </div>
        </div>

        {showInviteInput && (
          <div className="max-w-7xl mx-auto px-4 pb-5 sm:px-6 lg:px-8">
            <form onSubmit={handleJoinSeccion} className="flex gap-2 w-full max-w-md ml-auto bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
              <input
                type="text"
                placeholder="Pegar código de invitación..."
                value={tokenInvitacion}
                onChange={(e) => setTokenInvitacion(e.target.value)}
                className="flex-1 px-4 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-mono text-sm"
                required
                autoFocus
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                Unirse
              </button>
              <button type="button" onClick={() => setShowInviteInput(false)} className="bg-white hover:bg-gray-100 text-gray-600 font-bold py-2 px-3 rounded-xl border border-slate-200 transition-colors">
                ✕
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center my-24">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Cargando tus espacios...</p>
          </div>
        ) : secciones && secciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {secciones.map((seccion) => (
              <SeccionCard
                key={seccion.id}
                seccion={seccion}
                onSelect={onSelectSeccion}
                onOpenColabs={(s, e) => { setSeccionParaColabs(s); }}
                onDelete={handleDelete}
                getCodigoInvitacion={getCodigoInvitacion}
                regenerarCodigoInvitacion={regenerarCodigoInvitacion}
                onOpenProfile={(id) => setProfileUserId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Parece que está vacío</h2>
            <p className="text-slate-500 text-center max-w-md px-6 mb-8">
              Crea tu primera sección para empezar a organizar tus tareas o únete a una existente con un código de invitación.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100"
            >
              Crear primera Sección
            </button>
          </div>
        )}
      </div>

      {seccionParaColabs && (
        <ColaboradoresModal 
          seccion={seccionParaColabs} 
          onClose={() => setSeccionParaColabs(null)} 
          onOpenProfile={(id) => setProfileUserId(id)}
        />
      )}

      {showCreateModal && (
        <CreateSeccionModal onClose={() => { setShowCreateModal(false); fetchSecciones(); }} />
      )}

      {profileUserId && (
        <UserProfileModal 
          userId={profileUserId} 
          onClose={() => setProfileUserId(null)} 
        />
      )}
    </div>
  );
}
