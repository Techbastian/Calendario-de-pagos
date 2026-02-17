
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Clock, CheckCircle, Send, CreditCard } from 'lucide-react';
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
  getDate,
  getMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Payment } from './types';
import Calendar from './components/Calendar';
import SummaryCards from './components/SummaryCards';
import PaymentModal from './components/PaymentModal';

const MONTHLY_SCHEDULE: Record<number, { payments: number[], billing: number[] }> = {
  // Reglas 2026: Días hábiles (L-V), Última semana, Max 3 días pago, Evitar Festivos.
  0: { billing: [26, 27], payments: [28, 29, 30] },      // Enero: L-V (Semana completa fin de mes)
  1: { billing: [23, 24], payments: [25, 26, 27] },      // Febrero: L-V (Semana completa fin de mes)
  2: { billing: [24, 25], payments: [26, 27, 30] },      // Marzo: Evita festivo Lun 23. Pagos Jue, Vie, Lun 30.
  3: { billing: [24, 27], payments: [28, 29, 30] },      // Abril: Vie 24, Lun 27. Pagos Mar-Jue (fin de mes 30).
  4: { billing: [25, 26], payments: [27, 28, 29] },      // Mayo: L-V (Semana 25-29)
  5: { billing: [22, 23], payments: [24, 25, 26] },      // Junio: Adelantado para evitar festivo Lun 29 y cierre.
  6: { billing: [27, 28], payments: [29, 30, 31] },      // Julio: L-V (Semana 27-31)
  7: { billing: [25, 26], payments: [27, 28, 31] },      // Agosto: Evita fin de semana. Pagos Jue, Vie, Lun 31.
  8: { billing: [24, 25], payments: [28, 29, 30] },      // Septiembre: Jue-Vie Recepción. Lun-Mié Pagos.
  9: { billing: [26, 27], payments: [28, 29, 30] },      // Octubre: L-V (Semana 26-30)
  10: { billing: [24, 25], payments: [26, 27, 30] },     // Noviembre: Evita festivo Lun 16. Fin de mes Lun 30.
  11: { billing: [14, 15], payments: [16, 17, 18] },     // Diciembre: Adelantado por cierre anual (L-V).
};

const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const App: React.FC = () => {
  // Initialize to 2026 to match the schedule context
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('purple_calendar_payments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [initialDateForAdd, setInitialDateForAdd] = useState<string | undefined>(undefined);

  const getSystemPaymentsForDate = (date: Date): Payment[] => {
    const month = getMonth(date);
    const day = getDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = MONTHLY_SCHEDULE[month];
    const systemItems: Payment[] = [];

    if (!schedule) return systemItems;

    if (schedule.billing.includes(day)) {
      systemItems.push({
        id: `sys-billing-${dateStr}`,
        date: dateStr,
        description: 'Recepción obligatoria: Cuentas de cobro y Facturas.',
        recipient: 'Recepción Facturas',
        amount: 0,
        status: 'pending'
      });
    }

    if (schedule.payments.includes(day)) {
      systemItems.push({
        id: `sys-payment-${dateStr}`,
        date: dateStr,
        description: 'Ejecución programada de pagos a proveedores.',
        recipient: 'Administración / Pagos',
        amount: 0,
        status: 'pending'
      });
    }

    return systemItems;
  };

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
    if (payment.id.startsWith('sys-')) {
      setSelectedPayment({
        ...payment,
        id: `converted-${Math.random().toString(36).substr(2, 9)}`
      });
    } else {
      setSelectedPayment(payment);
    }
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
    if (selectedPayment && !selectedPayment.id.startsWith('sys-')) {
      setPayments(prev => {
        const exists = prev.some(p => p.id === selectedPayment.id);
        if (exists) {
          return prev.map(p => p.id === selectedPayment.id ? { ...paymentData, id: p.id } : p);
        } else {
          return [...prev, { ...paymentData, id: selectedPayment.id }];
        }
      });
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

  // Determine if the selected payment is an existing saved payment in the state
  const isExistingPayment = selectedPayment && payments.some(p => p.id === selectedPayment.id);

  return (
    <div className={`min-h-screen transition-all duration-500 pb-12 overflow-x-hidden`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl font-light bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 drop-shadow-lg tracking-tight">
              Cronograma de Pagos 2026
            </h1>
            <p className="text-purple-300/80 mt-2 font-bold text-lg flex items-center gap-2">
              <span className="w-8 h-[2px] bg-purple-500/50"></span>
              Operaciones del Mes
            </p>
          </div>
          
          <div className="flex items-center gap-4 animate-in slide-in-from-right duration-700">
            <button 
              onClick={() => handleAddPayment()}
              className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white transition-all px-8 py-4 rounded-2xl font-bold shadow-xl shadow-purple-900/40 hover:-translate-y-1"
            >
              <Plus size={24} strokeWidth={3} />
              <span className="hidden sm:inline">Nuevo Registro</span>
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="animate-in fade-in zoom-in duration-700 delay-100">
          <SummaryCards payments={payments} />
        </div>

        {/* Calendar Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <div className="calendar-card bg-purple-950/20 border border-purple-800/30 rounded-[2.5rem] p-4 md:p-8 shadow-2xl">
            <Calendar 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate}
              payments={payments}
              getSystemPaymentsForDate={getSystemPaymentsForDate}
              onDayClick={handleDayClick}
              onEditPayment={handleEditPayment}
            />
          </div>
        </div>

        <footer className="text-center text-purple-100/20 text-[10px] font-bold tracking-[0.4em] uppercase py-12">
          Diseño Escandinavo &bull; COP {new Date().getFullYear()}
        </footer>
      </div>

      {/* Day Selection Modal */}
      {isSelectionOpen && selectedDay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a091a] border border-purple-800/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-purple-900/50 flex justify-between items-center bg-purple-950/20">
              <div>
                <h3 className="text-2xl font-light text-purple-50 capitalize">
                  {format(selectedDay, 'EEEE, d MMMM', { locale: es })}
                </h3>
                <p className="text-[10px] font-bold text-purple-500 mt-1 uppercase tracking-widest">Tareas del día</p>
              </div>
              <button onClick={() => setIsSelectionOpen(false)} className="p-3 hover:bg-white/10 rounded-full text-purple-400 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                ...payments.filter(p => isSameDay(parseISO(p.date), selectedDay)),
                ...getSystemPaymentsForDate(selectedDay)
              ].map((p, i) => {
                const isSystem = p.id.startsWith('sys-');
                const isBilling = p.id.includes('billing');

                return (
                  <button
                    key={p.id + i}
                    onClick={() => handleEditPayment(p)}
                    className={`w-full text-left p-6 group transition-all duration-300 rounded-3xl border flex items-center justify-between
                      ${isSystem 
                        ? (isBilling ? 'bg-blue-900/10 border-blue-500/30' : 'bg-fuchsia-900/10 border-fuchsia-500/30')
                        : 'bg-purple-900/10 border-purple-500/30'
                      }
                      hover:scale-[1.02] hover:shadow-lg
                    `}
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        {isSystem ? (
                          isBilling ? <Send size={14} className="text-blue-500" /> : <CreditCard size={14} className="text-fuchsia-500" />
                        ) : (
                          p.status === 'completed' ? <CheckCircle size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-tighter
                          ${isSystem ? (isBilling ? 'text-blue-500' : 'text-fuchsia-500') : (p.status === 'completed' ? 'text-emerald-500' : 'text-amber-600')}
                        `}>
                          {isSystem ? (isBilling ? 'Recepción Facturas' : 'Sugerencia Pago') : (p.status === 'completed' ? 'Completado' : 'Por hacer')}
                        </span>
                      </div>
                      <p className="font-bold text-purple-50 text-lg leading-tight">{p.recipient}</p>
                      <p className="text-xs text-purple-400/60 mt-1 font-medium italic line-clamp-1">{p.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-mono text-lg text-purple-100 font-bold">
                        {formatCOP(p.amount)}
                      </span>
                      <div className="p-2 bg-purple-950/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 size={16} className="text-purple-300" />
                      </div>
                    </div>
                  </button>
                );
              })}
              
              <button
                onClick={() => handleAddPayment(format(selectedDay, 'yyyy-MM-dd'))}
                className="w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-purple-800/50 hover:border-purple-500 hover:bg-purple-900/20 rounded-3xl transition-all text-purple-800"
              >
                <Plus size={32} strokeWidth={3} />
                <span className="font-bold uppercase tracking-widest text-[10px]">Nueva Operación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <PaymentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePayment}
          onDelete={isExistingPayment && selectedPayment ? () => handleDeletePayment(selectedPayment.id) : undefined}
          payment={selectedPayment}
          initialDate={initialDateForAdd}
        />
      )}
    </div>
  );
};

export default App;
