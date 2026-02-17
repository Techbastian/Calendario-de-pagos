
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
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  payment,
  initialDate,
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

  const inputClasses = "w-full bg-purple-900/10 border border-purple-800 focus:border-purple-500 rounded-2xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all text-purple-50 placeholder-purple-700 font-bold shadow-inner";
  const labelClasses = "text-[10px] font-bold uppercase tracking-[0.2em] text-purple-500/60 mb-2 block ml-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-[#05040a] border border-purple-800/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 border-b border-purple-900/50 flex justify-between items-center bg-purple-950/10">
          <h3 className="text-2xl font-light flex items-center gap-3 text-purple-50 tracking-tight">
            {payment ? <Edit3 size={24} className="text-indigo-400" /> : <Save size={24} className="text-indigo-400" />}
            {payment ? 'Editar Registro COP' : 'Nueva Operación COP'}
          </h3>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-purple-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 font-bold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Fecha Ejecución</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Estado Actual</label>
              <select 
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="pending" className="bg-[#05040a]">Pendiente</option>
                <option value="completed" className="bg-[#05040a]">Realizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Beneficiario o Concepto</label>
            <input 
              type="text" 
              placeholder="Ej: Nómina, Factura #44..."
              value={formData.recipient}
              onChange={e => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Monto Pesos (COP)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400 font-bold">$</span>
              <input 
                type="number" 
                placeholder="0"
                value={formData.amount || ''}
                onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className={`${inputClasses} pl-10 font-mono text-xl text-indigo-300`}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Observaciones</label>
            <textarea 
              rows={3}
              placeholder="Detalles de la transacción..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`${inputClasses} resize-none font-bold`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {onDelete && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete();
                }}
                className="order-2 sm:order-1 flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 transition-all px-8 py-4 rounded-2xl font-bold cursor-pointer"
              >
                <Trash2 size={20} />
                Borrar
              </button>
            )}
            <button 
              type="submit"
              className="order-1 sm:order-2 flex-[2] flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white transition-all px-8 py-4 rounded-2xl font-bold shadow-xl shadow-purple-900/20"
            >
              <Save size={20} />
              {payment ? 'Guardar Cambios' : 'Confirmar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
