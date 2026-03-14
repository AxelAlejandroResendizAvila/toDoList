import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTareas } from '../hooks/useTareas';
import { useAuth } from '../hooks/useAuth';
import CreateTareaModal from './CreateTareaModal';
import TareaDetailsModal from './TareaDetailsModal';
import UserProfileModal from './UserProfileModal';

import { PRIORIDAD, ESTATUS } from '../constants/tareaConstants';


// Helper de permisos
const puedeEditar = (rol) => rol === 'ADMIN' || rol === 'EDITOR';

export default function TareaList({ seccion, onBack }) {
  const {
    tareas,
    loading,
    error,
    fetchTareas,
    updateTarea,
    deleteTarea,
    getColaboradores,
    asignarVariosATarea,
    actualizarEstatusIndividual
  } = useTareas();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState('TODAS');
  const [colaboradoresSeccion, setColaboradoresSeccion] = useState([]);
  const [tareaAsignandoId, setTareaAsignandoId] = useState(null);
  const [tareaDetalle, setTareaDetalle] = useState(null);
  const [tempAsignados, setTempAsignados] = useState([]);
  const [profileUserId, setProfileUserId] = useState(null);

  // El rol viene incluido en el objeto seccion desde /api/secciones/me
  const rol = seccion?.rol || 'LECTOR';
  const canEdit = puedeEditar(rol);

  useEffect(() => {
    if (seccion && seccion.id) {
      fetchTareas(seccion.id);
      getColaboradores(seccion.id).then(setColaboradoresSeccion).catch(console.error);
    }
  }, [fetchTareas, getColaboradores, seccion]);

  const handleToggleIndividualStatus = async (tarea) => {
    // Buscar si el usuario actual está asignado
    const miAsignacion = tarea.asignaciones?.find(asig => asig.usuario.correo === user?.correo);
    
    if (!miAsignacion) {
      // Si no estoy asignado pero puedo editar, tal vez quiero asignarme o cambiar el global (si no hay asignados)
      if (canEdit && (!tarea.asignaciones || tarea.asignaciones.length === 0)) {
         handleToggleGlobal(tarea);
      }
      return;
    }

    // Ciclo: PENDIENTE -> EN_PROCESO -> COMPLETADA -> PENDIENTE
    let nextStatus = 'PENDIENTE';
    if (miAsignacion.estatusStr === 'PENDIENTE') nextStatus = 'EN_PROCESO';
    else if (miAsignacion.estatusStr === 'EN_PROCESO') nextStatus = 'COMPLETADA';

    try {
      await actualizarEstatusIndividual(tarea.id, nextStatus);
    } catch (err) {
      console.error('Error al actualizar estatus individual:', err);
    }
  };

  const handleToggleGlobal = async (tarea) => {
    try {
      await updateTarea(tarea.id, {
        ...tarea,
        estatus: tarea.estatus === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA',
        seccion: { id: seccion.id },
      });
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!canEdit) return;
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTarea(id);
      } catch (err) {
        console.error('Error al eliminar tarea:', err);
      }
    }
  };

  const tareasFiltradas = (tareas || []).filter((t) => {
    if (filtro === 'TODAS') return true;
    return t.estatus === filtro;
  });

  const completadas = (tareas || []).filter((t) => t.estatus === 'COMPLETADA').length;
  const total = (tareas || []).length;
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const rolBadge = {
    ADMIN:  { label: 'Admin',  color: 'bg-purple-100 text-purple-700 border-purple-200' },
    EDITOR: { label: 'Editor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    LECTOR: { label: 'Solo lectura', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  }[rol] || { label: rol, color: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 truncate">{seccion.nombre}</h1>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${rolBadge.color}`}>
                    {rolBadge.label}
                  </span>
                </div>
                {seccion.descripcion && (
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-1" title={seccion.descripcion}>
                    {seccion.descripcion}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-slate-400 text-xs flex-shrink-0">
                    {completadas} de {total} tareas completadas
                  </p>
                  
                  {/* Avatares de colaboradores de la sección */}
                  <div className="flex -space-x-2 overflow-hidden items-center ml-2 border-l border-slate-200 pl-4">
                    {colaboradoresSeccion.slice(0, 5).map((colab, i) => (
                      <button 
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setProfileUserId(colab.usuario?.id); }}
                        className="h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm hover:scale-110 hover:z-10 transition-all cursor-pointer leading-none flex-shrink-0"
                        title={`${colab.usuario?.nombre} (${colab.rol}) - Ver perfil`}
                      >
                        <span className="mb-[1px]">{colab.usuario?.nombre?.charAt(0).toUpperCase()}</span>
                      </button>
                    ))}
                    {colaboradoresSeccion.length > 5 && (
                      <div className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shadow-sm leading-none flex-shrink-0">
                        <span className="mb-[1px]">+{colaboradoresSeccion.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Nueva Tarea – solo si puede editar */}
            {canEdit ? (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nueva Tarea
              </button>
            ) : (
              /* Banner informativo para lectores */
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-xl border border-amber-200 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
                Modo solo lectura
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progreso</span>
                <span className="font-semibold text-indigo-600">{progreso}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['TODAS', 'PENDIENTE', 'EN_PROCESO', 'COMPLETADA'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filtro === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {f === 'TODAS' ? 'Todas' : ESTATUS[f]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando tareas...</p>
          </div>
        ) : tareasFiltradas.length > 0 ? (
          <div className="space-y-3">
            {tareasFiltradas.map((tarea) => {
              const estatus = tarea.estatus || 'PENDIENTE';
              const prio = PRIORIDAD[tarea.prioridad] || PRIORIDAD[2];
              const completada = estatus === 'COMPLETADA';
              return (
                <div
                  key={tarea.id}
                  onClick={() => setTareaDetalle(tarea)}
                  className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all group cursor-pointer ${
                    completada ? 'border-slate-100 opacity-70' : 'border-slate-100 hover:border-indigo-100 hover:shadow-md'
                  }`}
                >
                  {/* Checkbox / Estatus indicator */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleIndividualStatus(tarea);
                      }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        estatus === 'COMPLETADA'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : estatus === 'EN_PROCESO'
                            ? 'border-indigo-500 bg-indigo-50 animate-pulse'
                            : 'border-slate-300 hover:border-indigo-400'
                      }`}
                      title={
                        tarea.asignaciones?.find(asig => asig.usuario.correo === user?.correo)
                        ? "Haz clic para cambiar tu progreso (Pendiente -> En Proceso -> Completado)"
                        : "Solo los asignados pueden marcar su progreso individual"
                      }
                    >
                      {estatus === 'COMPLETADA' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : estatus === 'EN_PROCESO' ? (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      ) : null}
                    </button>
                    
                    {/* Badge de estatus global */}
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      estatus === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' :
                      estatus === 'EN_PROCESO' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {estatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className={`font-semibold text-slate-800 truncate ${completada ? 'line-through text-slate-400' : ''}`}>
                        {tarea.nombre}
                      </h3>
                      {tarea.prioridad && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${prio.color}`}>
                          {prio.label}
                        </span>
                      )}
                    </div>
                    {tarea.descripcion && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{tarea.descripcion}</p>
                    )}
                    {tarea.fechaLimite && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(tarea.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}

                    {/* Asignados */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {tarea.asignaciones?.filter(asig => asig.usuario).map((asig) => (
                          <button
                            key={asig.id}
                            onClick={(e) => { e.stopPropagation(); setProfileUserId(asig.usuario.id); }}
                            className={`h-7 w-7 flex-shrink-0 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all hover:scale-110 hover:z-10 cursor-pointer leading-none ${
                              asig.estatusStr === 'COMPLETADA' ? 'bg-emerald-500' :
                              asig.estatusStr === 'EN_PROCESO' ? 'bg-indigo-500' :
                              'bg-slate-400'
                            }`}
                            title={`${asig.usuario?.nombre || 'Desconocido'} (${asig.estatusStr}) - Ver perfil`}
                          >
                            <span className="mb-[1px]">{(asig.usuario?.nombre || '?').charAt(0).toUpperCase()}</span>
                          </button>
                        ))}
                      </div>
                      
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tareaAsignandoId === tarea.id) {
                              setTareaAsignandoId(null);
                            } else {
                              setTareaAsignandoId(tarea.id);
                              setTempAsignados(tarea.asignaciones?.map(a => a.usuario.correo) || []);
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg transition-colors border border-indigo-100"
                        >
                          {tareaAsignandoId === tarea.id ? 'Cerrar' : '+ Gestionar'}
                        </button>
                      )}
                    </div>

                    {/* Dropdown de asignación - Estilo Lista con Confirmación */}
                    {tareaAsignandoId === tarea.id && (
                      <div className="mt-3 p-4 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50 animate-in zoom-in-95 duration-200 z-10 relative">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Seleccionar Colaboradores</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {colaboradoresSeccion
                            .filter(colab => colab.usuario)
                            .map(colab => {
                              const isChecked = tempAsignados.includes(colab.usuario.correo);
                              return (
                                <button
                                  key={colab.id}
                                  type="button"
                                  onClick={() => {
                                    setTempAsignados(prev => 
                                      prev.includes(colab.usuario.correo) 
                                      ? prev.filter(c => c !== colab.usuario.correo)
                                      : [...prev, colab.usuario.correo]
                                    );
                                  }}
                                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all text-left ${
                                    isChecked 
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                      : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                  }`}>
                                    {isChecked && (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold truncate">{colab.usuario.nombre}</p>
                                    <p className="text-[10px] opacity-60 truncate">{colab.usuario.correo}</p>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await asignarVariosATarea(tarea.id, tempAsignados);
                                setTareaAsignandoId(null);
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                          >
                            Confirmar Cambios
                          </button>
                          <button
                            onClick={() => {
                              setTareaAsignandoId(null);
                            }}
                            className="px-4 bg-slate-100 text-slate-500 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón eliminar – solo para editores/admins */}
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tarea.id);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Eliminar tarea"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-1">No hay tareas aquí</h2>
            <p className="text-slate-400 text-sm mb-6">
              {filtro !== 'TODAS' ? 'No hay tareas con este filtro.' : canEdit ? 'Crea tu primera tarea para empezar.' : 'Esta sección aún no tiene tareas.'}
            </p>
            {filtro === 'TODAS' && canEdit && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-7 rounded-xl transition-all shadow-lg shadow-indigo-100"
              >
                Crear primera tarea
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && canEdit && (
        <CreateTareaModal
          seccion={seccion}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {tareaDetalle && (
        <TareaDetailsModal 
          tarea={tareaDetalle} 
          user={user}
          onClose={() => setTareaDetalle(null)} 
          onOpenProfile={(id) => setProfileUserId(id)}
        />
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
