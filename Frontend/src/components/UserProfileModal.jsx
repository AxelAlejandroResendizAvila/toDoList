import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export default function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      userService.getProfile(userId)
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudo cargar el perfil');
          setLoading(false);
        });
    }
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header con gradiente */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col items-center -mt-12">
          {/* Avatar grande */}
          <div className="w-28 h-28 rounded-[2rem] bg-white p-2 shadow-2xl shadow-indigo-200 flex-shrink-0 relative">
            <div className="w-full h-full rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-5xl font-black text-indigo-600 leading-none">
              <span className="mb-1">{profile?.nombre?.charAt(0).toUpperCase() || '?'}</span>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="text-slate-400 text-sm font-medium">Cargando...</p>
            </div>
          ) : error ? (
            <div className="mt-6 text-center">
              <p className="text-rose-500 font-bold">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 text-indigo-600 font-bold py-2 px-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mt-4">
                <h2 className="text-2xl font-black text-slate-900">{profile.nombre}</h2>
                <p className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full inline-block mt-2">
                  Colaborador
                </p>
              </div>

              {/* Información de contacto */}
              <div className="w-full mt-8 space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correo</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{profile.correo}</p>
                  </div>
                </div>

                {profile.telefono && (
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teléfono</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{profile.telefono}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Secciones en común */}
              <div className="w-full mt-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espacios compartidos</p>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {profile.seccionesEnComun?.length || 0}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {profile.seccionesEnComun && profile.seccionesEnComun.length > 0 ? (
                    profile.seccionesEnComun.map(seccion => (
                      <div 
                        key={seccion.id} 
                        className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 group transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {seccion.nombre}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-xl border border-slate-100 w-full text-center">
                      No hay espacios compartidos aún.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
