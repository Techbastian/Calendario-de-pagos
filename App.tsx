
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Clock, CheckCircle, Send, CreditCard, Sun, Moon } from 'lucide-react';
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
import { Payment, Theme } from './types';
import Calendar from './components/Calendar';
import SummaryCards from './components/SummaryCards';
import PaymentModal from './components/PaymentModal';
import AlertModal, { AlertType } from './components/AlertModal';

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

const TAX_SCHEDULE = [
  { name: 'RETENCION EN LA FUENTE', color: 'sky', dates: [
    { m: 1, d: 16 }, { m: 2, d: 16 }, { m: 3, d: 17 }, { m: 4, d: 19 }, 
    { m: 5, d: 17 }, { m: 6, d: 15 }, { m: 7, d: 19 }, { m: 8, d: 15 }, 
    { m: 9, d: 16 }, { m: 10, d: 18 }, { m: 11, d: 16 }
  ]},
  { name: 'RETENCION DE ICA BIMESTRAL', color: 'orange', dates: [
    { m: 2, d: 20 }, { m: 4, d: 22 }, { m: 6, d: 17 }, { m: 8, d: 18 }, { m: 10, d: 20 }
  ]},
  { name: 'INFORMACION EXOGENA SHD', color: 'yellow', dates: [{ m: 6, d: 1 }]},
  { name: 'DECLARACION DE RENTA', color: 'lime', dates: [{ m: 4, d: 19 }]},
  { name: 'IVA CUATRIMESTRAL', color: 'yellow', dates: [{ m: 4, d: 19 }, { m: 8, d: 15 }]},
  { name: 'INFORMACION EXOGENA DIAN', color: 'green', dates: [{ m: 4, d: 1 }]},
  { name: 'DECLARACION ICA ANUAL', color: 'purple', dates: [{ m: 1, d: 26 }]},
  { name: 'CAMARA DE COMERCIO', color: 'yellow', dates: [{ m: 2, d: 31 }]}
];

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

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('purple_calendar_theme');
    return (saved as Theme) || 'dark';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [initialDateForAdd, setInitialDateForAdd] = useState<string | undefined>(undefined);

  // Alert State
  const [alert, setAlert] = useState<{ show: boolean; type: AlertType; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ show: true, type, message });
  };

  const getSystemPaymentsForDate = (date: Date): Payment[] => {
    const month = getMonth(date);
    const day = getDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = MONTHLY_SCHEDULE[month];
    const systemItems: Payment[] = [];

    if (schedule) {
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
    }

    // Tax Obligations
    TAX_SCHEDULE.forEach(tax => {
      if (tax.dates.some(d => d.m === month && d.d === day)) {
        systemItems.push({
          id: `sys-tax-${tax.color}-${dateStr}-${tax.name.replace(/\s+/g, '')}`,
          date: dateStr,
          description: 'Obligación Tributaria / Legal',
          recipient: tax.name,
          amount: 0,
          status: 'pending'
        });
      }
    });

    // Monthly Model Delivery (5th of every month)
    if (day === 5) {
      systemItems.push({
        id: `sys-model-${dateStr}`,
        date: dateStr,
        description: 'Entrega mensual obligatoria',
        recipient: 'Entrega Modelo Financiero',
        amount: 0,
        status: 'pending'
      });
    }

    return systemItems;
  };

  useEffect(() => {
    localStorage.setItem('purple_calendar_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('purple_calendar_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      showAlert('delete', 'El evento ha sido eliminado correctamente.');
    }
  };

  const handleSavePayment = (paymentData: Omit<Payment, 'id'>) => {
    let type: AlertType = 'success';
    if (selectedPayment && !selectedPayment.id.startsWith('sys-')) {
      // Editing existing
      type = 'edit';
      setPayments(prev => {
        const exists = prev.some(p => p.id === selectedPayment.id);
        if (exists) {
          return prev.map(p => p.id === selectedPayment.id ? { ...paymentData, id: p.id } : p);
        } else {
          return [...prev, { ...paymentData, id: selectedPayment.id }];
        }
      });
      showAlert('edit', 'Los cambios se han guardado exitosamente.');
    } else {
      // Creating new
      const newPayment: Payment = {
        ...paymentData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setPayments(prev => [...prev, newPayment]);
      showAlert('success', 'Nueva operación registrada correctamente.');
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

  // Check if selectedPayment exists in the payments array by ID comparison
  const isExistingPayment = selectedPayment && payments.some(p => p.id === selectedPayment.id);

  const isDark = theme === 'dark';

  const getSystemPaymentStyles = (id: string) => {
    if (id.includes('billing')) {
      return {
        container: isDark ? 'bg-blue-900/10 border-blue-500/30' : 'bg-blue-50 border-blue-100',
        text: 'text-blue-500',
        label: 'Recepción Facturas',
        Icon: Send
      };
    }
    if (id.includes('payment')) {
      return {
        container: isDark ? 'bg-fuchsia-900/10 border-fuchsia-500/30' : 'bg-fuchsia-50 border-fuchsia-100',
        text: 'text-fuchsia-500',
        label: 'Sugerencia Pago',
        Icon: CreditCard
      };
    }
    if (id.includes('model')) {
      return {
        container: isDark ? 'bg-teal-900/10 border-teal-500/30' : 'bg-teal-50 border-teal-100',
        text: 'text-teal-500',
        label: 'Entrega Mensual',
        Icon: Clock
      };
    }
    
    // Taxes
    const colors: Record<string, any> = {
      'tax-sky': { 
        container: isDark ? 'bg-sky-900/10 border-sky-500/30' : 'bg-sky-50 border-sky-100', 
        text: 'text-sky-500' 
      },
      'tax-orange': { 
        container: isDark ? 'bg-orange-900/10 border-orange-500/30' : 'bg-orange-50 border-orange-100', 
        text: 'text-orange-500' 
      },
      'tax-yellow': { 
        container: isDark ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-100', 
        text: 'text-yellow-600' 
      },
      'tax-lime': { 
        container: isDark ? 'bg-lime-900/10 border-lime-500/30' : 'bg-lime-50 border-lime-100', 
        text: 'text-lime-600' 
      },
      'tax-green': { 
        container: isDark ? 'bg-green-900/10 border-green-500/30' : 'bg-green-50 border-green-100', 
        text: 'text-green-600' 
      },
      'tax-purple': { 
        container: isDark ? 'bg-purple-900/10 border-purple-500/30' : 'bg-purple-50 border-purple-100', 
        text: 'text-purple-500' 
      }
    };

    const colorKey = Object.keys(colors).find(k => id.includes(k));
    if (colorKey) {
      return {
        ...colors[colorKey],
        label: 'Impuesto / Obligación',
        Icon: Clock
      };
    }

    return {
      container: isDark ? 'bg-gray-800/30 border-gray-500/30' : 'bg-gray-50 border-gray-200',
      text: 'text-gray-500',
      label: 'Sistema',
      Icon: Clock
    };
  };

  // Background styles
  const mainBgClass = isDark 
    ? "bg-[#05040a] text-[#f5f3ff] bg-[radial-gradient(at_0%_0%,#1e1b4b_0px,transparent_35%),radial-gradient(at_100%_0%,#2e1065_0px,transparent_35%),radial-gradient(at_50%_100%,#1a0b2e_0px,transparent_50%),radial-gradient(at_80%_20%,#0a091a_0px,transparent_40%)]"
    : "bg-slate-50 text-slate-900 bg-[radial-gradient(at_0%_0%,#f3e8ff_0px,transparent_50%),radial-gradient(at_100%_100%,#e0e7ff_0px,transparent_50%)]";

  return (
    <div className={`min-h-screen transition-all duration-700 pb-12 overflow-x-hidden ${mainBgClass}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className={`text-5xl font-light bg-clip-text text-transparent drop-shadow-lg tracking-tight ${isDark ? 'bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'}`}>
              Cronograma de Pagos 2026
            </h1>
            <p className={`mt-2 font-bold text-lg flex items-center gap-2 ${isDark ? 'text-purple-300/80' : 'text-purple-600/70'}`}>
              <span className="w-8 h-[2px] bg-purple-500/50"></span>
              Operaciones del Mes
            </p>
          </div>
          
          <div className="flex items-center gap-4 animate-in slide-in-from-right duration-700">
            <button 
              onClick={toggleTheme}
              className={`p-4 rounded-2xl transition-all shadow-xl hover:-translate-y-1 ${isDark ? 'bg-purple-900/20 text-yellow-300 hover:bg-purple-800/30' : 'bg-white text-purple-600 shadow-purple-100 hover:bg-purple-50'}`}
              title="Cambiar Tema"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
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
          <SummaryCards payments={payments} theme={theme} />
        </div>

        {/* Calendar Card */}
        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          <div className={`calendar-card border rounded-[2.5rem] p-4 md:p-8 shadow-2xl transition-colors duration-500 ${isDark ? 'bg-purple-950/20 border-purple-800/30' : 'bg-white/70 border-white/50 shadow-purple-100'}`}>
            <Calendar 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate}
              payments={payments}
              getSystemPaymentsForDate={getSystemPaymentsForDate}
              onDayClick={handleDayClick}
              onEditPayment={handleEditPayment}
              theme={theme}
            />
          </div>
        </div>

        <footer className={`text-center text-[10px] font-bold tracking-[0.4em] uppercase py-12 ${isDark ? 'text-purple-100/20' : 'text-purple-900/20'}`}>
          Diseño Escandinavo &bull; COP {new Date().getFullYear()}
        </footer>
      </div>

      {/* Day Selection Modal */}
      {isSelectionOpen && selectedDay && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300 ${isDark ? 'bg-black/80' : 'bg-white/40'}`}>
          <div className={`border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#0a091a] border-purple-800/50' : 'bg-white border-purple-100'}`}>
            <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'border-purple-900/50 bg-purple-950/20' : 'border-purple-100 bg-purple-50'}`}>
              <div>
                <h3 className={`text-2xl font-light capitalize ${isDark ? 'text-purple-50' : 'text-purple-900'}`}>
                  {format(selectedDay, 'EEEE, d MMMM', { locale: es })}
                </h3>
                <p className="text-[10px] font-bold text-purple-500 mt-1 uppercase tracking-widest">Tareas del día</p>
              </div>
              <button onClick={() => setIsSelectionOpen(false)} className={`p-3 rounded-full transition-all ${isDark ? 'hover:bg-white/10 text-purple-400' : 'hover:bg-purple-100 text-purple-600'}`}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {[
                ...payments.filter(p => isSameDay(parseISO(p.date), selectedDay)),
                ...getSystemPaymentsForDate(selectedDay)
              ].map((p, i) => {
                const isSystem = p.id.startsWith('sys-');
                let styles = {
                  container: isDark ? 'bg-purple-900/10 border-purple-500/30' : 'bg-purple-50 border-purple-100',
                  text: p.status === 'completed' ? 'text-emerald-500' : 'text-amber-600',
                  label: p.status === 'completed' ? 'Completado' : 'Por hacer',
                  Icon: p.status === 'completed' ? CheckCircle : Clock
                };

                if (isSystem) {
                  styles = getSystemPaymentStyles(p.id);
                }

                return (
                  <button
                    key={p.id + i}
                    onClick={() => handleEditPayment(p)}
                    className={`w-full text-left p-6 group transition-all duration-300 rounded-3xl border flex items-center justify-between
                      ${styles.container}
                      hover:scale-[1.02] hover:shadow-lg
                    `}
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <styles.Icon size={14} className={styles.text} />
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${styles.text}`}>
                          {styles.label}
                        </span>
                      </div>
                      <p className={`font-bold text-lg leading-tight ${isDark ? 'text-purple-50' : 'text-purple-900'}`}>{p.recipient}</p>
                      <p className={`text-xs mt-1 font-medium italic line-clamp-1 ${isDark ? 'text-purple-400/60' : 'text-purple-400'}`}>{p.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`font-mono text-lg font-bold ${isDark ? 'text-purple-100' : 'text-purple-800'}`}>
                        {formatCOP(p.amount)}
                      </span>
                      <div className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-purple-950/50' : 'bg-purple-200/50'}`}>
                        <Edit3 size={16} className={isDark ? "text-purple-300" : "text-purple-600"} />
                      </div>
                    </div>
                  </button>
                );
              })}
              
              <button
                onClick={() => handleAddPayment(format(selectedDay, 'yyyy-MM-dd'))}
                className={`w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-3xl transition-all ${isDark ? 'border-purple-800/50 hover:border-purple-500 hover:bg-purple-900/20 text-purple-800' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-400'}`}
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
          theme={theme}
        />
      )}

      {/* Custom Alert Modal */}
      <AlertModal 
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        theme={theme}
      />
    </div>
  );
};

export default App;
