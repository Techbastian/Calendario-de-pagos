
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Edit3, ChevronLeft, ChevronRight, CheckCircle, Clock, DollarSign, List, X } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  getDate
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Payment, PaymentStatus } from './types';
import Calendar from './components/Calendar';
import SummaryCards from './components/SummaryCards';
import PaymentModal from './components/PaymentModal';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('purple_calendar_payments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [initialDateForAdd, setInitialDateForAdd] = useState<string | undefined>(undefined);

  // Helper to get system-defined tasks for a specific date
  const getSystemPaymentsForDate = (date: Date): Payment[] => {
    const dayOfMonth = getDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const systemItems: Payment[] = [];

    // Range 21-23: Envíos de cuentas de cobro
    if (dayOfMonth >= 21 && dayOfMonth <= 23) {
      systemItems.push({
        id: `sys-invoice-${dateStr}`,
        date: dateStr,
        description: 'Envío de cuentas de cobro (Tarea Programada)',
        recipient: 'Varios / Clientes',
        amount: 0,
        status: 'pending'
      });
    }

    // Range 23-28: Realizar pagos
    if (dayOfMonth >= 23 && dayOfMonth <= 28) {
      systemItems.push({
        id: `sys-payment-${dateStr}`,
        date: dateStr,
        description: 'Realizar pagos mensuales (Tarea Programada)',
        recipient: 'Proveedores / Servicios',
        amount: 0,
        status: 'pending'
      });
    }

    return systemItems;
  };

  // Combine user payments with system payments
  // We prioritize user-saved versions of system payments if they exist (based on description/date)
  const allPayments = useMemo(() => {
    // For the current view month, we can visualize them.
    // However, to keep it simple, we only show system items in the UI logic.
    return payments;
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('purple_calendar_payments', JSON.stringify(payments));
  }, [payments]);

  const handleAddPayment = (date?: string) => {
    setSelectedPayment(undefined);
    setInitialDateForAdd(date || format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
    setIsSelectionOpen(false);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
    setIsSelectionOpen(false);
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleSavePayment = (paymentData: Omit<Payment, 'id'>) => {
    if (selectedPayment) {
      setPayments(prev => prev.map(p => p.id === selectedPayment.id ? { ...paymentData, id: p.id } : p));
    } else {
      const newPayment: Payment = {
        ...paymentData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setPayments(prev => [...prev, newPayment]);
    }
    setIsModalOpen(false);
  };

  const handleDayClick = (date: Date) => {
    const dayPayments = payments.filter(p => isSameDay(parseISO(p.date), date));
    const systemItems = getSystemPaymentsForDate(date);
    const totalItems = [...dayPayments, ...systemItems];

    if (totalItems.length > 0) {
      setSelectedDay(date);
      setIsSelectionOpen(true);
    } else {
      handleAddPayment(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0a1f] text-purple-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
              Gestión de Pagos
            </h1>
            <p className="text-purple-400 mt-1">Control de cobros y obligaciones mensuales</p>
          </div>
          
          <button 
            onClick={() => handleAddPayment()}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-900/20"
          >
            <Plus size={20} />
            Nuevo Registro
          </button>
        </header>

        {/* Stats Summary */}
        <SummaryCards payments={payments} />

        {/* Main Content: Calendar */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-sm">
          <Calendar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate}
            payments={payments}
            getSystemPaymentsForDate={getSystemPaymentsForDate}
            onDayClick={handleDayClick}
            onEditPayment={handleEditPayment}
          />
        </div>

        {/* Footer info */}
        <footer className="text-center text-purple-500 text-sm pb-8">
          Sistema de Control Financiero Personal &bull; {new Date().getFullYear()}
        </footer>
      </div>

      {/* Day Selection Modal */}
      {isSelectionOpen && selectedDay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1a142e] border border-purple-500/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-purple-800 flex justify-between items-center bg-purple-900/40">
              <h3 className="text-lg font-bold">
                Actividades - {format(selectedDay, 'd MMMM', { locale: es })}
              </h3>
              <button onClick={() => setIsSelectionOpen(false)} className="p-2 hover:bg-purple-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {/* Combine real payments and system items for display */}
              {[
                ...payments.filter(p => isSameDay(parseISO(p.date), selectedDay)),
                ...getSystemPaymentsForDate(selectedDay)
              ].map((p, i) => (
                <button
                  key={p.id + i}
                  onClick={() => handleEditPayment(p)}
                  className="w-full text-left p-4 bg-purple-800/20 hover:bg-purple-700/40 border border-purple-700/50 rounded-2xl transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 mr-4">
                    <p className="font-bold text-purple-100 line-clamp-1">{p.recipient}</p>
                    <p className="text-xs text-purple-400 line-clamp-2 italic">{p.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono text-sm text-fuchsia-300">${p.amount.toLocaleString()}</span>
                    <Edit3 size={16} className="text-purple-500 group-hover:text-purple-300" />
                  </div>
                </button>
              ))}
              <button
                onClick={() => handleAddPayment(format(selectedDay, 'yyyy-MM-dd'))}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-700 hover:border-purple-500 hover:bg-purple-900/30 rounded-2xl transition-all text-purple-400 font-semibold"
              >
                <Plus size={18} />
                Agregar Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (Combined Add/Edit) */}
      {isModalOpen && (
        <PaymentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePayment}
          onDelete={selectedPayment && !selectedPayment.id.startsWith('sys-') ? () => handleDeletePayment(selectedPayment.id) : undefined}
          payment={selectedPayment}
          initialDate={initialDateForAdd}
        />
      )}
    </div>
  );
};

export default App;
