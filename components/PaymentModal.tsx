
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
  initialDate
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
    if (!formData.description || !formData.recipient || formData.amount <= 0) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1a142e] border border-purple-500/50 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-800 flex justify-between items-center bg-purple-900/40">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {payment ? <Edit3 size={20} className="text-purple-400" /> : <Save size={20} className="text-purple-400" />}
            {payment ? 'Editar Registro' : 'Nuevo Pago / Cobro'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-purple-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-400">Fecha de Ejecución</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-purple-400">Estado</label>
              <select 
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
                className="w-full bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-100"
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Realizado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-400">A quién va dirigido / Remitente</label>
            <input 
              type="text" 
              placeholder="Ej: Empresa de Energía, Juan Pérez..."
              value={formData.recipient}
              onChange={e => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
              className="w-full bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-400">Monto del Pago (USD)</label>
            <input 
              type="number" 
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              className="w-full bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-100 font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-400">Descripción / Motivo</label>
            <textarea 
              rows={3}
              placeholder="Descripción breve del pago o cobro..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-purple-900/30 border border-purple-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-purple-100 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {payment && onDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 transition-all px-6 py-3 rounded-xl font-semibold"
              >
                <Trash2 size={20} />
                Eliminar
              </button>
            )}
            <button 
              type="submit"
              className="flex-[2] flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 transition-all px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/20 text-white"
            >
              <Save size={20} />
              {payment ? 'Actualizar' : 'Guardar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
