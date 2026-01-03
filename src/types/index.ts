export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface PaymentMethod {
  tngNumber?: string;
  duitnowId?: string;
  qrCode?: string;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  role: 'organizer' | 'participant';
  avatar?: string;
  paymentMethod?: PaymentMethod;
}

export interface Expense {
  id: string;
  eventId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitType: 'equal' | 'custom' | 'selective';
  shares: Record<string, number>;
  selectedParticipants?: string[]; // IDs of participants involved in this expense
  date: Date;
  receipt?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: Date;
  image?: string;
  participants: Participant[];
  expenses: Expense[];
  createdBy: string;
  createdAt: Date;
}

export interface Balance {
  userId: string;
  amount: number;
  owes: Record<string, number>;
  owedBy: Record<string, number>;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}
