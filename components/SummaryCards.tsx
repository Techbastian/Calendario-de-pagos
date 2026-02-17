import React from 'react';
import { DollarSign, List, CheckCircle, Clock } from 'lucide-react';
import { Payment } from '../types';

interface SummaryCardsProps {
  payments: Payment[];
}

const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ payments }) => {
  const stats = React.useMemo(() => {
    const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
    const count = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = count - completed;
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

    return { totalAmount, count, completed, pending, pendingAmount };
  }, [payments]);

  const cards = [
    { 
      label: 'Registrado Total', 
      value: formatCOP(stats.totalAmount), 
      icon: DollarSign, 
      color: 'text-indigo-300',
      bg: 'bg-indigo-950/20',
      border: 'border-indigo-500/20'
    },
    { 
      label: 'Asignaciones', 
      value: stats.count, 
      icon: List, 
      color: 'text-purple-300',
      bg: 'bg-purple-950/20',
      border: 'border-purple-500/20'
    },
    { 
      label: 'Pagos Finalizados', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/20'
    },
    { 
      label: 'Pendiente COP', 
      value: formatCOP(stats.pendingAmount), 
      sub: `${stats.pending} ítems`,
      icon: Clock, 
      color: 'text-amber-400',
      bg: 'bg-amber-950/20',
      border: 'border-amber-200/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className={`bg-purple-900/5 border-2 ${card.border} p-8 rounded-[2.2rem] backdrop-blur-xl hover:bg-purple-900/10 transition-all duration-500 group shadow-lg hover:shadow-xl`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-purple-500/70 text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-4">{card.label}</p>
              <h3 className={`text-2xl font-bold ${card.color} tracking-tight break-words`}>{card.value}</h3>
              {card.sub && (
                <div className="mt-3 text-[10px] text-purple-400/50 font-bold uppercase tracking-widest">{card.sub}</div>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-500 shadow-sm border ${card.border}`}>
              <card.icon size={24} className={card.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;