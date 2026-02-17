
import React, { useState } from 'react';
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
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Send, Zap } from 'lucide-react';
import { Payment, Theme } from '../types';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  payments: Payment[];
  getSystemPaymentsForDate: (date: Date) => Payment[];
  onDayClick: (date: Date) => void;
  onEditPayment: (payment: Payment) => void;
  theme: Theme;
}

const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const Calendar: React.FC<CalendarProps> = ({ 
  currentDate, 
  setCurrentDate, 
  payments, 
  getSystemPaymentsForDate,
  onDayClick,
  onEditPayment,
  theme
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Button styles based on theme
  const btnClass = isDark 
    ? "bg-purple-900/20 hover:bg-white/10 border-purple-800/50 text-purple-300" 
    : "bg-white hover:bg-purple-50 border-purple-100 text-purple-600 shadow-sm";
    
  const todayBtnClass = isDark
    ? "bg-purple-900/20 hover:bg-purple-800/40 border-purple-800/50 text-purple-100"
    : "bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-800";

  return (
    <div className={`select-none ${isDark ? 'text-purple-100' : 'text-slate-700'}`}>
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <h2 className={`text-4xl font-light capitalize tracking-tight ${isDark ? 'text-purple-50' : 'text-purple-900'}`}>
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <p className={`font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-500/60'}`}>Control Financiero</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className={`p-3 rounded-2xl transition-all border active:scale-95 ${btnClass}`}>
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className={`px-6 py-3 rounded-2xl transition-all border text-sm font-bold active:scale-95 ${todayBtnClass}`}>
            Hoy
          </button>
          <button onClick={nextMonth} className={`p-3 rounded-2xl transition-all border active:scale-95 ${btnClass}`}>
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-sm ${isDark ? 'bg-blue-950/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
          <Send size={14} className="text-blue-500" />
          <span className={`${isDark ? 'text-blue-200' : 'text-blue-700'} text-[9px] font-bold uppercase tracking-widest`}>Recepción Facturas</span>
        </div>
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-sm ${isDark ? 'bg-fuchsia-950/20 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-100'}`}>
          <Zap size={14} className="text-fuchsia-500" />
          <span className={`${isDark ? 'text-fuchsia-200' : 'text-fuchsia-700'} text-[9px] font-bold uppercase tracking-widest`}>Ejecución Pagos</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className={`text-center text-[11px] font-bold uppercase tracking-[0.2em] py-2 ${isDark ? 'text-purple-600' : 'text-purple-400/60'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, idx) => {
          const userPayments = payments.filter(p => isSameDay(parseISO(p.date), day));
          const systemPayments = getSystemPaymentsForDate(day);
          const dayPayments = [...userPayments, ...systemPayments];
          
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayKey = format(day, 'yyyy-MM-dd');
          
          const hasBilling = systemPayments.some(p => p.id.includes('billing'));
          const hasPaymentExec = systemPayments.some(p => p.id.includes('payment'));

          // Cell Styling Logic
          let cellClass = "bg-transparent border-transparent opacity-[0.05] pointer-events-none";
          if (isCurrentMonth) {
             if (isDark) {
                cellClass = "bg-purple-900/5 border-purple-900/30 hover:bg-purple-900/15 hover:border-purple-600/50";
             } else {
                cellClass = "bg-white border-purple-100 hover:bg-purple-50 hover:border-purple-300 shadow-sm";
             }
          }
          
          const todayRing = isToday 
            ? (isDark ? 'ring-2 ring-purple-400 border-purple-400' : 'ring-2 ring-purple-500 border-purple-500') 
            : '';

          return (
            <div 
              key={idx}
              className={`
                relative min-h-[110px] md:min-h-[135px] p-3 border rounded-[1.8rem] transition-all duration-300 cursor-pointer group flex flex-col
                ${cellClass}
                ${isCurrentMonth ? 'hover:shadow-xl' : ''}
                ${todayRing}
                ${isToday ? 'scale-[1.03] z-10' : ''}
              `}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => setHoveredDate(dayKey)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {isCurrentMonth && (
                <div className="absolute inset-0 pointer-events-none rounded-[1.8rem] overflow-hidden opacity-[0.12]">
                  {hasBilling && <div className="absolute top-0 left-0 right-0 h-1/2 bg-blue-500" />}
                  {hasPaymentExec && <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-fuchsia-500" />}
                </div>
              )}

              <div className="relative z-10 flex justify-between items-start mb-2">
                <span className={`text-xl font-bold ${isToday ? (isDark ? 'text-white' : 'text-purple-900') : (isDark ? 'text-purple-800/60' : 'text-purple-300')}`}>
                  {getDate(day)}
                </span>
                {dayPayments.length > 0 && (
                  <span className="bg-gradient-to-br from-purple-500 to-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-lg text-white shadow-lg">
                    {dayPayments.length}
                  </span>
                )}
              </div>

              <div className="mt-auto relative z-10 space-y-1 pb-2">
                {dayPayments.slice(0, 3).map((p, i) => (
                  <div key={p.id + i} className={`h-1 rounded-full ${
                    p.id.startsWith('sys-') 
                    ? (p.id.includes('billing') ? 'bg-blue-400' : 'bg-fuchsia-400') 
                    : (p.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400')
                  }`} />
                ))}
              </div>

              {hoveredDate === dayKey && dayPayments.length > 0 && (
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-[115%] mb-4 z-50 w-72 rounded-3xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200 border ${isDark ? 'bg-[#0a091a] border-purple-800/50' : 'bg-white border-purple-100'}`}>
                  <div className="flex flex-col gap-4">
                    <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] border-b pb-3 text-center ${isDark ? 'text-purple-400 border-purple-900' : 'text-purple-600 border-purple-100'}`}>
                      {format(day, 'd MMMM yyyy', { locale: es })}
                    </h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {dayPayments.map((p, i) => {
                        const isSys = p.id.startsWith('sys-');
                        return (
                          <div 
                            key={p.id + i} 
                            className={`text-xs flex flex-col gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                              isDark 
                              ? 'bg-purple-900/10 border-purple-800/30 hover:bg-purple-800/20' 
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                            }`}
                            onClick={(e) => { e.stopPropagation(); onEditPayment(p); }}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className={`font-bold truncate flex-1 ${isDark ? 'text-purple-100' : 'text-purple-900'}`}>{p.recipient}</span>
                              {p.amount > 0 && <span className="font-mono text-indigo-500 font-bold">{formatCOP(p.amount)}</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isSys ? (
                                <Zap size={10} className="text-fuchsia-500" />
                              ) : p.status === 'completed' ? (
                                <CheckCircle size={10} className="text-emerald-500" />
                              ) : (
                                <Clock size={10} className="text-amber-500" />
                              )}
                              <span className={`text-[8px] font-bold uppercase ${isDark ? 'text-purple-400' : 'text-purple-400/80'}`}>
                                {isSys ? 'Estimado' : (p.status === 'completed' ? 'Listo' : 'Pendiente')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 border-r border-b rotate-45 ${isDark ? 'bg-[#0a091a] border-purple-800/50' : 'bg-white border-purple-100'}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
