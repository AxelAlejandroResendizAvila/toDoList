import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTareas } from '../hooks/useTareas';

const ROL_CONFIG = {
  ADMIN:  { label: 'Admin',  color: 'bg-purple-100 text-purple-600' },
  EDITOR: { label: 'Editor', color: 'bg-blue-100 text-blue-600' },
  LECTOR: { label: 'Lector', color: 'bg-slate-100 text-slate-500' },
};

export default function Sidebar({ onSelectSeccion, currentSeccionId, onGoHome, onLogout, onCollapsedChange }) {
  const { user } = useAuth();
  const { secciones, fetchSecciones } = useTareas();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (onCollapsedChange) onCollapsedChange(next);
  };

  useEffect(() => {
    if (user) fetchSecciones();
  }, [fetchSecciones, user]);

  const misAdmin = secciones.filter(s => s.rol === 'ADMIN');
  const miembro  = secciones.filter(s => s.rol !== 'ADMIN');

  const avatarLetter = user?.nombre?.charAt(0).toUpperCase() || '?';

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-100 shadow-xl flex flex-col z-40 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
          {!collapsed && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">ToDoList</span>
            </button>
          )}
          {collapsed && (
            <button onClick={onGoHome} className="mx-auto">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </button>
          )}
          <button
            onClick={toggleCollapsed}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ${collapsed ? 'mx-auto mt-0' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Secciones */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5">

          {/* Mis secciones (ADMIN) */}
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Mis secciones
              </p>
            )}
            <div className="space-y-0.5">
              {misAdmin.length === 0 && !collapsed && (
                <p className="text-xs text-slate-400 px-3 py-2 italic">Sin secciones aún</p>
              )}
              {misAdmin.map(s => (
                <SeccionItem
                  key={s.id}
                  seccion={s}
                  active={currentSeccionId === s.id}
                  collapsed={collapsed}
                  onClick={() => onSelectSeccion(s)}
                />
              ))}
            </div>
          </div>

          {/* Secciones compartidas */}
          {miembro.length > 0 && (
            <div>
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  Compartidas
                </p>
              )}
              {collapsed && <div className="border-t border-slate-100 mx-2 mb-2" />}
              <div className="space-y-0.5">
                {miembro.map(s => (
                  <SeccionItem
                    key={s.id}
                    seccion={s}
                    active={currentSeccionId === s.id}
                    collapsed={collapsed}
                    onClick={() => onSelectSeccion(s)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer usuario */}
        <div className="border-t border-slate-100 p-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-indigo-100">
              {avatarLetter}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.nombre}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.correo}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
            {collapsed && (
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="hidden"
              />
            )}
          </div>
          {collapsed && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="mt-2 w-full flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function SeccionItem({ seccion, active, collapsed, onClick }) {
  const rol = ROL_CONFIG[seccion.rol] || ROL_CONFIG.LECTOR;
  const initial = seccion.nombre.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      title={collapsed ? seccion.nombre : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
        active
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {/* Icono / inicial */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
      }`}>
        {initial}
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-slate-700'}`}>
            {seccion.nombre}
          </p>
          <p className={`text-[10px] font-medium ${active ? 'text-indigo-100' : 'text-slate-400'}`}>
            {rol.label}
          </p>
        </div>
      )}

      {/* Punto activo si collapsed */}
      {collapsed && active && (
        <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full" />
      )}
    </button>
  );
}
