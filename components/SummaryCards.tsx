
import React from 'react';
import { DollarSign, List, CheckCircle, Clock } from 'lucide-react';
import { Payment } from '../types';

interface SummaryCardsProps {
  payments: Payment[];
}

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
      label: 'Sumatoria Total', 
      value: `$${stats.totalAmount.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-fuchsia-600 dark:text-fuchsia-400',
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10'
    },
    { 
      label: 'Número de Pagos', 
      value: stats.count, 
      icon: List, 
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-500/10'
    },
    { 
      label: 'Pagos Realizados', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-500/10'
    },
    { 
      label: 'Pendientes', 
      value: stats.pending, 
      sub: `$${stats.pendingAmount.toLocaleString()}`,
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-500/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white/80 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 p-6 rounded-3xl backdrop-blur-md shadow-lg shadow-purple-500/5 hover:border-purple-400 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-500 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">{card.label}</p>
              <h3 className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</h3>
              {card.sub && <p className="text-[10px] text-purple-400 dark:text-purple-500 mt-1 font-bold">{card.sub} por cobrar/pagar</p>}
            </div>
            <div className={`p-3 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              <card.icon size={22} className={card.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
