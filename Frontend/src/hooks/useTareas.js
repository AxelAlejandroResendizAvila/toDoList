import { useContext } from 'react';
import { TareaContext } from '../context/TareaContext';

export const useTareas = () => {
  const context = useContext(TareaContext);
  if (!context) {
    throw new Error('useTareas debe usarse dentro de TareaProvider');
  }
  return context;
};
