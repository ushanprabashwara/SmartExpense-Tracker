export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  type: TransactionType;
  paymentMethod?: string; // only for expenses
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  completed: boolean;
  dateCreated: string;
}

export interface BillReminder {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  category: string;
  isPaid: boolean;
}

export interface Budget {
  limit: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  currency: string; // Currency code
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Scholarship',
  'Freelance',
  'Business',
  'Gift',
  'Investment',
  'Other'
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Shopping',
  'Entertainment',
  'Education',
  'Healthcare',
  'Utilities',
  'Travel',
  'Other'
];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Digital Wallet',
  'Bank Transfer'
];
