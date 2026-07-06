import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  TrendingDown, 
  Trash2, 
  Edit3, 
  CreditCard,
  X,
  Sparkles,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, EXPENSE_CATEGORIES, PAYMENT_METHODS, CURRENCIES } from '../types';

export const ExpensesView: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, settings, budget } = useApp();
  
  // Search and state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  // Calculations
  const expenseList = transactions.filter(t => t.type === 'expense');
  
  const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0);
  const avgExpense = expenseList.length > 0 ? totalExpense / expenseList.length : 0;
  
  // Find top expense category
  const categoryCounts: { [key: string]: number } = {};
  expenseList.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + t.amount;
  });
  let topCategory = 'None';
  let maxCatAmount = 0;
  Object.entries(categoryCounts).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = cat;
    }
  });

  // Filtered list
  const filteredExpenses = expenseList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingTransaction(null);
    setTitle('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTitle(tx.title);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setPaymentMethod(tx.paymentMethod || PAYMENT_METHODS[0]);
    setDate(tx.date);
    setNotes(tx.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!title.trim()) {
      setFormError('Please enter a descriptive title.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid, positive expense amount.');
      return;
    }
    if (!date) {
      setFormError('Please select a valid date.');
      return;
    }

    const txData = {
      title: title.trim(),
      amount: parsedAmount,
      category,
      paymentMethod,
      date,
      notes: notes.trim(),
      type: 'expense' as const
    };

    // Budget warning calculations
    const predictedTotal = totalExpense - (editingTransaction?.amount || 0) + parsedAmount;
    if (budget > 0 && predictedTotal > budget) {
      if (!confirm(`Warning: Adding this expense will exceed your monthly budget limit of ${currencySymbol}${budget} (Estimated spent: ${currencySymbol}${predictedTotal.toFixed(2)}). Do you wish to continue?`)) {
        return;
      }
    } else if (budget > 0 && predictedTotal >= budget * 0.8) {
      alert(`Budget Warning: You have consumed over 80% of your budget limit! (New Total Spent: ${currencySymbol}${predictedTotal.toFixed(2)} / ${currencySymbol}${budget})`);
    }

    if (editingTransaction) {
      updateTransaction({
        ...txData,
        id: editingTransaction.id
      });
    } else {
      addTransaction(txData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the expense "${title}"?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
            Expense Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log, organize, and filter your daily expenditures and financial leaks.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/10 transition-all cursor-pointer"
        >
          <Plus size={16} /> Record Expense
        </button>
      </div>

      {/* Analytical summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Total Expenses</div>
            <div className="font-display font-bold text-xl lg:text-2xl text-slate-800 dark:text-white mt-1">
              {currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Average Expense</div>
            <div className="font-display font-bold text-xl lg:text-2xl text-slate-800 dark:text-white mt-1">
              {currencySymbol}{avgExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Top Expense Sector</div>
            <div className="font-display font-bold text-xl lg:text-2xl text-slate-800 dark:text-white mt-1 line-clamp-1">
              {topCategory} 
              {maxCatAmount > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">({currencySymbol}{maxCatAmount})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Controls header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="Search expenses by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <CreditCard size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-medium">No expenses logged yet</p>
            <p className="text-xs mt-1">Try resetting your category filters or log a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Expense Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Payment Method</th>
                  <th className="py-4 px-4">Date Charged</th>
                  <th className="py-4 px-4">Notes</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                {filteredExpenses.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{tx.title}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono">{tx.date}</td>
                    <td className="py-4 px-4 max-w-xs truncate italic text-slate-400 dark:text-slate-500" title={tx.notes}>
                      {tx.notes || '—'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      -{currencySymbol}{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white">
                {editingTransaction ? 'Modify Expense Entry' : 'Log Daily Expense'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                <Info size={14} />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Expense Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Weekly Groceries"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
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
                    placeholder="e.g. 15.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Sector Category *
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 transition-all cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 transition-all cursor-pointer"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Charge Date *
                  </label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Receipt Notes (Optional)
                </label>
                <textarea 
                  placeholder="e.g. Paid at Walmart, includes office supplies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/10 transition-all cursor-pointer"
                >
                  {editingTransaction ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
