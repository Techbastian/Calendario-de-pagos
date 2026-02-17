
export type PaymentStatus = 'pending' | 'completed';

export interface Payment {
  id: string;
  date: string; // ISO format
  description: string;
  recipient: string;
  amount: number;
  status: PaymentStatus;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  payments: Payment[];
}

export type Theme = 'dark' | 'light';
