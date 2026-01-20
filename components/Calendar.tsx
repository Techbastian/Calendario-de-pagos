
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
}

const Calendar: React.FC<CalendarProps> = ({ 
  currentDate, 
  setCurrentDate, 
  payments, 
  getSystemPaymentsForDate,
  onDayClick,
  onEditPayment
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-purple-800 rounded-full transition-colors border border-purple-700"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 hover:bg-purple-800 rounded-lg transition-colors border border-purple-700 text-sm"
          >
            Hoy
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-purple-800 rounded-full transition-colors border border-purple-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Ranges Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/40 border border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          <span className="text-blue-300">Día 21-23: Envíos Cobro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-fuchsia-500/40 border border-fuchsia-400 shadow-[0_0_8px_rgba(192,38,211,0.5)]"></div>
          <span className="text-fuchsia-300">Día 23-28: Realizar Pagos</span>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-purple-400 text-xs font-semibold uppercase tracking-wider py-2">
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

          // Check if day is in predefined range
          const isInCobroRange = dayNum >= 21 && dayNum <= 23;
          const isInPagoRange = dayNum >= 23 && dayNum <= 28;

          return (
            <div 
              key={idx}
              className={`
                relative min-h-[100px] md:min-h-[120px] p-2 border rounded-xl transition-all duration-200 cursor-pointer group
                ${isCurrentMonth ? 'bg-purple-800/20 border-purple-700/50 hover:bg-purple-800/40' : 'bg-transparent border-transparent opacity-10 hover:opacity-20'}
                ${isToday ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0f0a1f] border-transparent' : ''}
              `}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => setHoveredDate(dayKey)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Range Background Highlights */}
              {isCurrentMonth && (
                <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-30">
                  {isInCobroRange && <div className="absolute top-0 left-0 right-0 h-1/2 bg-blue-500/20" />}
                  {isInPagoRange && <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-fuchsia-500/20" />}
                </div>
              )}

              <div className="relative z-10 flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${isToday ? 'text-purple-100' : 'text-purple-300'}`}>
                  {dayNum}
                </span>
                {dayPayments.length > 0 && (
                  <span className="bg-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white">
                    {dayPayments.length}
                  </span>
                )}
              </div>

              {/* Mini Indicators */}
              <div className="relative z-10 space-y-1">
                {dayPayments.slice(0, 3).map((p) => (
                  <div 
                    key={p.id} 
                    className={`h-1.5 rounded-full ${
                      p.id.startsWith('sys-') 
                      ? (p.id.includes('invoice') ? 'bg-blue-400' : 'bg-fuchsia-400') 
                      : (p.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400')
                    }`}
                  />
                ))}
                {dayPayments.length > 3 && (
                  <div className="h-1 text-[8px] text-center text-purple-500 font-bold">...</div>
                )}
              </div>

              {/* Tooltip / Info Box on Hover */}
              {hoveredDate === dayKey && dayPayments.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-64 bg-purple-900 border border-purple-500 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest border-b border-purple-700 pb-2">
                      Actividades: {format(day, 'd MMMM', { locale: es })}
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {dayPayments.map((p, i) => (
                        <div 
                          key={p.id + i} 
                          className="text-xs flex flex-col gap-1 p-2 bg-purple-950/50 rounded-lg hover:bg-purple-800/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPayment(p);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-purple-100 truncate w-32">{p.recipient}</span>
                            {p.amount > 0 && <span className="font-mono text-fuchsia-300">${p.amount.toLocaleString()}</span>}
                          </div>
                          <p className="text-purple-400 italic line-clamp-1">{p.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {p.id.startsWith('sys-') ? (
                              p.id.includes('invoice') 
                                ? <><Send size={10} className="text-blue-400" /> <span className="text-blue-400/80">Sugerido: Cobro</span></>
                                : <><FileText size={10} className="text-fuchsia-400" /> <span className="text-fuchsia-400/80">Sugerido: Pago</span></>
                            ) : p.status === 'completed' ? (
                              <><CheckCircle size={10} className="text-emerald-400" /> <span className="text-emerald-400/80">Pagado</span></>
                            ) : (
                              <><Clock size={10} className="text-amber-400" /> <span className="text-amber-400/80">Pendiente</span></>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-900 border-r border-b border-purple-500 rotate-45"></div>
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
