import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowUpDown, 
  Filter, 
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, CURRENCIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';

export const TransactionsTable: React.FC = () => {
  const { transactions, deleteTransaction, settings } = useApp();

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(''); // e.g. "07"
  const [yearFilter, setYearFilter] = useState('');  // e.g. "2026"
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'highest' | 'lowest'>('latest');

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  const allCategories = Array.from(new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])).sort();

  // Month labels
  const MONTHS = [
    { code: '01', label: 'January' },
    { code: '02', label: 'February' },
    { code: '03', label: 'March' },
    { code: '04', label: 'April' },
    { code: '05', label: 'May' },
    { code: '06', label: 'June' },
    { code: '07', label: 'July' },
    { code: '08', label: 'August' },
    { code: '09', label: 'September' },
    { code: '10', label: 'October' },
    { code: '11', label: 'November' },
    { code: '12', label: 'December' }
  ];

  // Extract unique years from transactions for the filter dropdown
  const uniqueYears = Array.from(new Set<string>(transactions.map(t => {
    return t.date.split('-')[0];
  }))).sort((a, b) => b.localeCompare(a));

  // Handle delete
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      deleteTransaction(id);
    }
  };

  // Filter & Sort Logic
  const processedTransactions = transactions
    .filter(tx => {
      const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase()) || 
                            (tx.notes || '').toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      const matchesCategory = categoryFilter === '' || tx.category === categoryFilter;
      
      const [year, month] = tx.date.split('-');
      const matchesMonth = monthFilter === '' || month === monthFilter;
      const matchesYear = yearFilter === '' || year === yearFilter;

      return matchesSearch && matchesType && matchesCategory && matchesMonth && matchesYear;
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') {
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
      }
      if (sortOrder === 'oldest') {
        return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      }
      if (sortOrder === 'highest') {
        return b.amount - a.amount;
      }
      if (sortOrder === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
            Historical Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A comprehensive list of all recorded assets and debits with advanced filter parameters.
          </p>
        </div>
        
      </div>

      {/* Filter Parameters Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400">
          <Filter size={14} /> Filter Control Board
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Entries</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">Any Category</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Month filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">Any Month</option>
            {MONTHS.map(m => (
              <option key={m.code} value={m.code}>{m.label}</option>
            ))}
          </select>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">Any Year</option>
            {uniqueYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center justify-between text-xs pt-2">
          <div className="text-slate-400 dark:text-slate-500 font-medium">
            Showing {processedTransactions.length} transaction{processedTransactions.length !== 1 && 's'}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowUpDown size={13} />
            <span className="font-semibold text-slate-400">Sort By:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent border-0 py-0.5 focus:ring-0 font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              <option value="latest">Latest Logged</option>
              <option value="oldest">Oldest Logged</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {processedTransactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">
            <FileText size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold">No matched records found</p>
            <p className="text-xs mt-1">Adjust your parameters or record a new entry to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/10 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Source / Ledger Item</th>
                  <th className="py-4 px-4">Action Type</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Method</th>
                  <th className="py-4 px-4">Post Date</th>
                  <th className="py-4 px-4">Comment Notes</th>
                  <th className="py-4 px-4 text-right">Value Amount</th>
                  <th className="py-4 px-6 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                {processedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    {/* Item title */}
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{tx.title}</td>
                    
                    {/* Entry type */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                        ${tx.type === 'income' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                        }
                      `}>
                        {tx.type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {tx.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {tx.category}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4">
                      {tx.paymentMethod ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[10px] border border-slate-100 dark:border-slate-800">
                          {tx.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-mono">{tx.date}</td>

                    {/* Notes */}
                    <td className="py-4 px-4 max-w-xs truncate italic text-slate-400 dark:text-slate-500" title={tx.notes}>
                      {tx.notes || '—'}
                    </td>

                    {/* Amount */}
                    <td className={`py-4 px-4 text-right font-mono font-bold text-sm
                      ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
                    `}>
                      {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(tx.id, tx.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
