
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
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10'
    },
    { 
      label: 'Número de Pagos', 
      value: stats.count, 
      icon: List, 
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    { 
      label: 'Pagos Realizados', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: 'Pendientes', 
      value: stats.pending, 
      sub: `$${stats.pendingAmount.toLocaleString()}`,
      icon: Clock, 
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-purple-900/20 border border-purple-500/20 p-6 rounded-3xl backdrop-blur-sm hover:border-purple-500/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">{card.label}</p>
              <h3 className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
              {card.sub && <p className="text-xs text-purple-500 mt-1">{card.sub} en espera</p>}
            </div>
            <div className={`p-3 rounded-2xl ${card.bg}`}>
              <card.icon size={24} className={card.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
