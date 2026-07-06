/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpensesView } from './components/ExpensesView';
import { BudgetView } from './components/BudgetView';
import { SavingsView } from './components/SavingsView';
import { ReportsView } from './components/ReportsView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { TransactionsTable } from './components/TransactionsTable';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, CURRENCIES } from './types';
import { X, Info } from 'lucide-react';

function MainAppContent() {
  const { addTransaction, settings, budget, transactions } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Quick Add Modal State
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  const handleOpenQuickAdd = (type: 'income' | 'expense') => {
    setQuickAddType(type);
    setTitle('');
    setAmount('');
    setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a description.');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid, positive amount.');
      return;
    }

    if (quickAddType === 'expense' && budget > 0) {
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const predictedTotal = totalExpense + val;
      
      if (predictedTotal > budget) {
        if (!confirm(`Warning: Adding this expense will exceed your monthly budget of ${currencySymbol}${budget}. (New Total Spent: ${currencySymbol}${predictedTotal.toFixed(2)}). Continue?`)) {
          return;
        }
      }
    }

    addTransaction({
      title: title.trim(),
      amount: val,
      category,
      paymentMethod: quickAddType === 'expense' ? paymentMethod : undefined,
      date,
      notes: notes.trim(),
      type: quickAddType as 'income' | 'expense'
    });

    setQuickAddType(null);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-[#0b1329] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onQuickAdd={handleOpenQuickAdd} 
      />

      {/* Primary Workspace column */}
      <main className="flex-1 lg:h-screen overflow-y-auto px-4 py-6 md:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView onNavigate={setActiveTab} onQuickAdd={handleOpenQuickAdd} />
          )}
          {activeTab === 'income' && <IncomeView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'history' && <TransactionsTable />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'savings' && <SavingsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'about' && <AboutView />}

        </div>
      </main>

      {/* Global Quick Add Overlay Modal */}
      {quickAddType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white capitalize">
                Quick Add {quickAddType}
              </h3>
              <button 
                onClick={() => setQuickAddType(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                <Info size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Description / Source *
                </label>
                <input 
                  type="text"
                  required
                  placeholder={quickAddType === 'income' ? 'e.g. Consulting Fee' : 'e.g. Starbuck Coffee'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    {quickAddType === 'income' 
                      ? INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                      : EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    }
                  </select>
                </div>
              </div>

              {quickAddType === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Post Date *
                </label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Comments / Notes (Optional)
                </label>
                <textarea 
                  placeholder="Optional comments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAddType(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
