
import React, { useEffect } from 'react';
import { CheckCircle, Info, Trash2, X } from 'lucide-react';
import { Theme } from '../types';

export type AlertType = 'success' | 'edit' | 'delete';

interface AlertModalProps {
  isOpen: boolean;
  type: AlertType;
  message: string;
  onClose: () => void;
  theme: Theme;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, type, message, onClose, theme }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStyles = () => {
    // Definir estilos base según el tema
    const isDark = theme === 'dark';
    
    switch (type) {
      case 'success': // Crear (Verde)
        return {
          bg: isDark ? 'bg-[#05040a]' : 'bg-white',
          border: isDark ? 'border-emerald-500/50' : 'border-emerald-200',
          iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
          iconColor: 'text-emerald-500',
          titleColor: isDark ? 'text-emerald-400' : 'text-emerald-700',
          textColor: isDark ? 'text-emerald-200/70' : 'text-emerald-600/80',
          Icon: CheckCircle
        };
      case 'edit': // Editar (Azul)
        return {
          bg: isDark ? 'bg-[#05040a]' : 'bg-white',
          border: isDark ? 'border-blue-500/50' : 'border-blue-200',
          iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
          iconColor: 'text-blue-500',
          titleColor: isDark ? 'text-blue-400' : 'text-blue-700',
          textColor: isDark ? 'text-blue-200/70' : 'text-blue-600/80',
          Icon: Info
        };
      case 'delete': // Eliminar (Rojo)
        return {
          bg: isDark ? 'bg-[#05040a]' : 'bg-white',
          border: isDark ? 'border-red-500/50' : 'border-red-200',
          iconBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
          iconColor: 'text-red-500',
          titleColor: isDark ? 'text-red-400' : 'text-red-700',
          textColor: isDark ? 'text-red-200/70' : 'text-red-600/80',
          Icon: Trash2
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.Icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-top justify-center p-4 sm:p-6 pointer-events-none">
      <div className={`
        pointer-events-auto
        flex items-center gap-4 p-5 rounded-3xl shadow-2xl border
        animate-in slide-in-from-bottom-5 fade-in duration-300
        ${styles.bg} ${styles.border}
        max-w-md w-full backdrop-blur-xl
      `}>
        <div className={`p-3 rounded-2xl ${styles.iconBg} ${styles.iconColor}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h4 className={`text-lg font-bold ${styles.titleColor}`}>
            {type === 'success' ? '¡Creado!' : type === 'edit' ? '¡Actualizado!' : '¡Eliminado!'}
          </h4>
          <p className={`text-sm font-medium ${styles.textColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-500/10 transition-colors ${styles.titleColor}`}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
