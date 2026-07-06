import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Transaction, 
  SavingsGoal, 
  BillReminder, 
  AppSettings, 
  CURRENCIES 
} from '../types';

interface AppContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  billReminders: BillReminder[];
  budget: number;
  settings: AppSettings;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'completed' | 'dateCreated'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  addBillReminder: (reminder: Omit<BillReminder, 'id' | 'isPaid'>) => void;
  updateBillReminder: (reminder: BillReminder) => void;
  deleteBillReminder: (id: string) => void;
  toggleBillReminder: (id: string) => void;
  updateBudget: (limit: number) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => void;
  exportToCSV: () => void;
  getBackupJSON: () => string;
  restoreFromJSON: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_SAVINGS: SavingsGoal[] = [];
const EMPTY_REMINDERS: BillReminder[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [billReminders, setBillReminders] = useState<BillReminder[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [settings, setSettings] = useState<AppSettings>({ theme: 'light', currency: 'USD' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedTx = localStorage.getItem('smart_expense_transactions');
      const storedSavings = localStorage.getItem('smart_expense_savings');
      const storedReminders = localStorage.getItem('smart_expense_reminders');
      const storedBudget = localStorage.getItem('smart_expense_budget');
      const storedSettings = localStorage.getItem('smart_expense_settings');

      if (storedTx) {
        setTransactions(JSON.parse(storedTx));
      } else {
        setTransactions(EMPTY_TRANSACTIONS);
        localStorage.setItem('smart_expense_transactions', JSON.stringify(EMPTY_TRANSACTIONS));
      }

      if (storedSavings) {
        setSavingsGoals(JSON.parse(storedSavings));
      } else {
        setSavingsGoals(EMPTY_SAVINGS);
        localStorage.setItem('smart_expense_savings', JSON.stringify(EMPTY_SAVINGS));
      }

      if (storedReminders) {
        setBillReminders(JSON.parse(storedReminders));
      } else {
        setBillReminders(EMPTY_REMINDERS);
        localStorage.setItem('smart_expense_reminders', JSON.stringify(EMPTY_REMINDERS));
      }

      if (storedBudget) {
        setBudget(Number(storedBudget));
      } else {
        setBudget(0);
        localStorage.setItem('smart_expense_budget', '0');
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        // Apply theme immediately
        if (parsedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const defaultSettings: AppSettings = { theme: 'light', currency: 'USD' };
        setSettings(defaultSettings);
        localStorage.setItem('smart_expense_settings', JSON.stringify(defaultSettings));
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('smart_expense_transactions', JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('smart_expense_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('smart_expense_reminders', JSON.stringify(billReminders));
  }, [billReminders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('smart_expense_budget', budget.toString());
  }, [budget, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('smart_expense_settings', JSON.stringify(settings));
    
    // Manage class on body/root for theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, isLoaded]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 7)
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (tx: Transaction) => {
    setTransactions(prev => prev.map(item => item.id === tx.id ? tx : item));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  };

  // Savings Goal Actions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'completed' | 'dateCreated'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'sg_' + Date.now() + Math.random().toString(36).substring(2, 7),
      completed: goal.currentSavings >= goal.targetAmount,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    const updatedGoal = {
      ...goal,
      completed: goal.currentSavings >= goal.targetAmount
    };
    setSavingsGoals(prev => prev.map(item => item.id === goal.id ? updatedGoal : item));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(item => item.id !== id));
  };

  // Bill Reminder Actions
  const addBillReminder = (reminder: Omit<BillReminder, 'id' | 'isPaid'>) => {
    const newReminder: BillReminder = {
      ...reminder,
      id: 'br_' + Date.now() + Math.random().toString(36).substring(2, 7),
      isPaid: false
    };
    setBillReminders(prev => [...prev, newReminder]);
  };

  const updateBillReminder = (reminder: BillReminder) => {
    setBillReminders(prev => prev.map(item => item.id === reminder.id ? reminder : item));
  };

  const deleteBillReminder = (id: string) => {
    setBillReminders(prev => prev.filter(item => item.id !== id));
  };

  const toggleBillReminder = (id: string) => {
    setBillReminders(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isPaid: !item.isPaid };
      }
      return item;
    }));
  };

  const updateBudget = (limit: number) => {
    setBudget(limit);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const clearAllData = () => {
    setTransactions([]);
    setSavingsGoals([]);
    setBillReminders([]);
    setBudget(2500);
    setSettings({ theme: 'light', currency: 'USD' });
    localStorage.removeItem('smart_expense_transactions');
    localStorage.removeItem('smart_expense_savings');
    localStorage.removeItem('smart_expense_reminders');
    localStorage.removeItem('smart_expense_budget');
    localStorage.removeItem('smart_expense_settings');
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.category,
      t.date,
      t.paymentMethod || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smart_expense_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBackupJSON = () => {
    const data = {
      transactions,
      savingsGoals,
      billReminders,
      budget,
      settings
    };
    return JSON.stringify(data, null, 2);
  };

  const restoreFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.savingsGoals && Array.isArray(parsed.savingsGoals)) {
        setSavingsGoals(parsed.savingsGoals);
      }
      if (parsed.billReminders && Array.isArray(parsed.billReminders)) {
        setBillReminders(parsed.billReminders);
      }
      if (parsed.budget !== undefined) {
        setBudget(Number(parsed.budget));
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Error parsing backup JSON', e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      transactions,
      savingsGoals,
      billReminders,
      budget,
      settings,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addBillReminder,
      updateBillReminder,
      deleteBillReminder,
      toggleBillReminder,
      updateBudget,
      updateSettings,
      clearAllData,
      exportToCSV,
      getBackupJSON,
      restoreFromJSON
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
