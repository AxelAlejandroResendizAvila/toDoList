export const PRIORIDAD = {
  1: { label: 'Alta', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', gradient: 'from-red-600 to-rose-600' },
  2: { label: 'Media', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', gradient: 'from-amber-500 to-orange-500' },
  3: { label: 'Baja', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
};

export const ESTATUS = {
  PENDIENTE: { 
    label: 'Pendiente', 
    color: 'text-slate-600', 
    bg: 'bg-slate-50', 
    border: 'border-slate-200',
    dot: 'bg-slate-400' 
  },
  EN_PROCESO: { 
    label: 'En proceso', 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-200',
    dot: 'bg-indigo-500' 
  },
  COMPLETADA: { 
    label: 'Completada', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    dot: 'bg-emerald-500' 
  },
};
