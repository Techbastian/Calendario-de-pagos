
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3 } from 'lucide-react';
import { Payment, PaymentStatus } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'id'>) => void;
  onDelete?: () => void;
  payment?: Payment;
  initialDate?: string;
  theme: 'light' | 'dark';
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  payment,
  initialDate,
  theme
}) => {
  const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
    date: initialDate || new Date().toISOString().split('T')[0],
    description: '',
    recipient: '',
    amount: 0,
    status: 'pending' as PaymentStatus
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        date: payment.date,
        description: payment.description,
        recipient: payment.recipient,
        amount: payment.amount,
        status: payment.status
      });
    } else if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [payment, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.recipient || formData.amount < 0) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }
    onSave(formData);
  };

  const inputClasses = "w-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-900 dark:text-purple-100 placeholder-purple-300 dark:placeholder-purple-600";
  const labelClasses = "text-xs font-black uppercase tracking-widest text-purple-500 dark:text-purple-400 ml-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a142e] border border-purple-200 dark:border-purple-500/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-100 dark:border-purple-800 flex justify-between items-center bg-purple-50 dark:bg-purple-900/40">
          <h3 className="text-xl font-black flex items-center gap-3 text-purple-900 dark:text-purple-100">
            {payment ? <Edit3 size={24} className="text-purple-600 dark:text-purple-400" /> : <Save size={24} className="text-purple-600 dark:text-purple-400" />}
            {payment ? 'Editar Registro' : 'Nuevo Registro'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl transition-colors text-purple-400">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClasses}>Fecha</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Estado</label>
              <select 
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
                className={inputClasses}
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Realizado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Beneficiario / Concepto</label>
            <input 
              type="text" 
              placeholder="Ej: Pago Alquiler, Juan..."
              value={formData.recipient}
              onChange={e => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Monto ($)</label>
            <input 
              type="number" 
              step="any"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className={`${inputClasses} font-mono text-lg font-bold`}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>Descripción</label>
            <textarea 
              rows={3}
              placeholder="Notas adicionales..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            {payment && onDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="order-2 sm:order-1 flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 dark:border-red-500/50 transition-all px-6 py-3 rounded-2xl font-bold"
              >
                <Trash2 size={20} />
                Eliminar
              </button>
            )}
            <button 
              type="submit"
              className="order-1 sm:order-2 flex-[2] flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transition-all px-6 py-3 rounded-2xl font-black shadow-xl shadow-purple-600/20"
            >
              <Save size={20} />
              {payment ? 'Actualizar Datos' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
