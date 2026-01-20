
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
import { ChevronLeft, ChevronRight, Clock, CheckCircle, FileText, Send } from 'lucide-react';
import { Payment } from '../types';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  payments: Payment[];
  getSystemPaymentsForDate: (date: Date) => Payment[];
  onDayClick: (date: Date) => void;
  onEditPayment: (payment: Payment) => void;
  theme: 'light' | 'dark';
}

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getCombinedPaymentsForDay = (date: Date) => {
    const userPayments = payments.filter(p => isSameDay(parseISO(p.date), date));
    const systemPayments = getSystemPaymentsForDate(date);
    return [...userPayments, ...systemPayments];
  };

  return (
    <div className="select-none">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold capitalize text-purple-900 dark:text-purple-100">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl transition-colors border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl transition-colors border border-purple-200 dark:border-purple-700 text-sm font-bold text-purple-700 dark:text-purple-300"
          >
            Hoy
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl transition-colors border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Ranges Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-[10px] md:text-xs font-bold">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-200 dark:border-blue-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <span className="text-blue-700 dark:text-blue-300">21-23: Cobros</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-full border border-fuchsia-200 dark:border-fuchsia-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500"></div>
          <span className="text-fuchsia-700 dark:text-fuchsia-300">23-28: Pagos</span>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-purple-500 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const dayNum = getDate(day);
          const dayPayments = getCombinedPaymentsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayKey = format(day, 'yyyy-MM-dd');

          const isInCobroRange = dayNum >= 21 && dayNum <= 23;
          const isInPagoRange = dayNum >= 23 && dayNum <= 28;

          return (
            <div 
              key={idx}
              className={`
                relative min-h-[90px] md:min-h-[110px] p-2 border rounded-2xl transition-all duration-300 cursor-pointer group
                ${isCurrentMonth 
                  ? 'bg-purple-50 dark:bg-purple-800/20 border-purple-100 dark:border-purple-700/50 hover:shadow-lg hover:shadow-purple-500/10' 
                  : 'bg-transparent border-transparent opacity-20 hover:opacity-40'}
                ${isToday ? 'ring-2 ring-purple-600 dark:ring-purple-400 ring-offset-4 ring-offset-white dark:ring-offset-[#0f0a1f] border-transparent' : ''}
              `}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => setHoveredDate(dayKey)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Range Background Highlights */}
              {isCurrentMonth && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden opacity-10 dark:opacity-20">
                  {isInCobroRange && <div className="absolute top-0 left-0 right-0 h-1/2 bg-blue-500" />}
                  {isInPagoRange && <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-fuchsia-500" />}
                </div>
              )}

              <div className="relative z-10 flex justify-between items-start mb-1">
                <span className={`text-sm font-bold ${isToday ? 'text-purple-700 dark:text-purple-100' : 'text-purple-400 dark:text-purple-400'}`}>
                  {dayNum}
                </span>
                {dayPayments.length > 0 && (
                  <span className="bg-purple-600 dark:bg-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded-lg text-white">
                    {dayPayments.length}
                  </span>
                )}
              </div>

              {/* Mini Indicators */}
              <div className="relative z-10 space-y-1">
                {dayPayments.slice(0, 3).map((p) => (
                  <div 
                    key={p.id} 
                    className={`h-1.5 rounded-full shadow-sm ${
                      p.id.startsWith('sys-') 
                      ? (p.id.includes('invoice') ? 'bg-blue-400' : 'bg-fuchsia-400') 
                      : (p.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400')
                    }`}
                  />
                ))}
                {dayPayments.length > 3 && (
                  <div className="h-1 text-[8px] text-center text-purple-400 dark:text-purple-500 font-black">...</div>
                )}
              </div>

              {/* Tooltip */}
              {hoveredDate === dayKey && dayPayments.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-64 bg-white dark:bg-purple-900 border border-purple-200 dark:border-purple-500 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-300 uppercase tracking-widest border-b border-purple-100 dark:border-purple-800 pb-2">
                      {format(day, 'd MMMM', { locale: es })}
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {dayPayments.map((p, i) => (
                        <div 
                          key={p.id + i} 
                          className="text-xs flex flex-col gap-1 p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPayment(p);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-900 dark:text-purple-100 truncate w-32">{p.recipient}</span>
                            {p.amount > 0 && <span className="font-mono text-purple-600 dark:text-fuchsia-300 font-bold">${p.amount.toLocaleString()}</span>}
                          </div>
                          <p className="text-purple-600 dark:text-purple-400 italic line-clamp-1">{p.description}</p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold">
                            {p.id.startsWith('sys-') ? (
                              p.id.includes('invoice') 
                                ? <><Send size={10} className="text-blue-500" /> <span className="text-blue-600">Sugerido: Cobro</span></>
                                : <><FileText size={10} className="text-fuchsia-500" /> <span className="text-fuchsia-600">Sugerido: Pago</span></>
                            ) : p.status === 'completed' ? (
                              <><CheckCircle size={10} className="text-emerald-500" /> <span className="text-emerald-600">Realizado</span></>
                            ) : (
                              <><Clock size={10} className="text-amber-500" /> <span className="text-amber-600">Pendiente</span></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-purple-900 border-r border-b border-purple-200 dark:border-purple-500 rotate-45"></div>
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
