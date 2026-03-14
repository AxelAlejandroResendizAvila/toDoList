import { PRIORIDAD, ESTATUS } from '../constants/tareaConstants';

export default function TareaDetailsModal({ tarea, onClose, user, onOpenProfile }) {
  if (!tarea) return null;

  const priority = PRIORIDAD[tarea.prioridad] || PRIORIDAD[2];
  const globalStatus = ESTATUS[tarea.estatus] || ESTATUS.PENDIENTE;
  
  // Encontrar mi propia asignación
  const miAsignacion = tarea.asignaciones?.find(a => a.usuario?.correo === user?.correo);
  const miEstatus = miAsignacion ? (ESTATUS[miAsignacion.estatusStr] || ESTATUS.PENDIENTE) : null;

  // Calcular progreso detallado
  const totalAsignados = tarea.asignaciones?.length || 0;
  const completados = tarea.asignaciones?.filter(a => a.estatusStr === 'COMPLETADA').length || 0;
  const enProceso = tarea.asignaciones?.filter(a => a.estatusStr === 'EN_PROCESO').length || 0;
  const porcentajeCompletado = totalAsignados > 0 ? (completados / totalAsignados) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header Visual */}
        <div className={`h-32 relative bg-gradient-to-br ${priority.gradient} p-8`}>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="flex flex-col h-full justify-end">
            <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/30 text-white mb-2 backdrop-blur-sm`}>
              {priority.label}
            </span>
            <h2 className="text-3xl font-black text-white truncate drop-shadow-sm">
              {tarea.nombre}
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Estatus y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Estatus Global</p>
              <div className={`w-fit flex items-center gap-2 px-4 py-2 rounded-2xl border ${globalStatus.bg} ${globalStatus.color} ${globalStatus.border}`}>
                <span className="text-sm font-bold">{globalStatus.label}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Fecha Límite</p>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 italic">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString('es-ES', { dateStyle: 'long' }) : 'Sin fecha definida'}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descripción</p>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-h-[100px]">
              <p className="text-slate-600 leading-relaxed">
                {tarea.descripcion || 'Esta tarea no tiene una descripción detallada.'}
              </p>
            </div>
          </div>

          {/* Progreso Colaborativo */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Equipo</p>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                {completados}/{totalAsignados} Completados
              </span>
            </div>
            
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                style={{ width: `${porcentajeCompletado}%` }}
              />
              {/* Indicadores de segmentos */}
              {totalAsignados > 1 && Array.from({ length: totalAsignados - 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 h-full w-px bg-white/20" 
                  style={{ left: `${(100 / totalAsignados) * (i + 1)}%` }}
                />
              ))}
            </div>

            {/* Lista de Colaboradores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {tarea.asignaciones?.map((asig) => {
                const asigStatus = ESTATUS[asig.estatusStr] || ESTATUS.PENDIENTE;
                const isMe = asig.usuario?.correo === user?.correo;
                return (
                  <div 
                    key={asig.usuario?.id} 
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isMe ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'
                    }`}
                  >
                    <button 
                      onClick={() => onOpenProfile && onOpenProfile(asig.usuario?.id)}
                      className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-pointer leading-none ${
                        asig.estatusStr === 'COMPLETADA' ? 'bg-emerald-500' : 
                        asig.estatusStr === 'EN_PROCESO' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'
                      }`}
                      title="Ver perfil"
                    >
                      <span className="mb-[1px]">{asig.usuario?.nombre?.charAt(0).toUpperCase()}</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-slate-700 truncate">{asig.usuario?.nombre}</p>
                        {isMe && <span className="text-[9px] px-1 bg-indigo-600 text-white rounded font-bold uppercase">Tú</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${asigStatus.dot || 'bg-slate-300'}`} />
                        <p className={`text-[10px] font-bold ${asigStatus.color}`}>{asigStatus.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {totalAsignados === 0 && (
                <p className="col-span-full text-center text-xs text-slate-400 italic py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Nadie ha sido asignado a esta tarea todavía.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer con tu estatus personal si estás asignado */}
        {miAsignacion && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tu Estatus Actual</p>
                <p className={`text-sm font-black ${miEstatus.color}`}>{miEstatus.label}</p>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 flex items-center gap-2 italic">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Cambia tu progreso individual haciendo clic en el círculo de la tarea en la lista.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
