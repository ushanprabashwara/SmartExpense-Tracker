import React, { useState } from 'react';
import { 
  Landmark, 
  Edit3, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../types';

export const BudgetView: React.FC = () => {
  const { transactions, budget, updateBudget, settings } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  // Calculations
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget - totalExpense;
  const usagePercent = budget > 0 ? (totalExpense / budget) * 100 : 0;
  const isOverBudget = totalExpense > budget;
  const isNearLimit = usagePercent >= 80 && usagePercent <= 100;

  // Calculate category spending breakdown
  const categorySpending = EXPENSE_CATEGORIES.map(category => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    };
  }).filter(c => c.amount > 0) // only show categories with spending
    .sort((a, b) => b.amount - a.amount);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBudget);
    if (!isNaN(val) && val >= 0) {
      updateBudget(val);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your monthly budget limit to zero?')) {
      updateBudget(0);
      setNewBudget('0');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
          Budget Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Establish monthly limits, allocate spending, and monitor your remaining allocation.
        </p>
      </div>

      {/* Main Budget Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracker Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Monthly Spending Control
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setNewBudget(budget.toString());
                    setIsEditing(!isEditing);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Edit Budget"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                  title="Reset Budget"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="flex items-center gap-2 animate-fade-in">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Set Limit"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-3xl lg:text-4xl text-slate-800 dark:text-white">
                    {currencySymbol}{budget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Limit Per Month</span>
                </div>
                {saveSuccess && (
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Budget limit saved successfully!
                  </div>
                )}
              </div>
            )}

            {/* Warning Alerts */}
            {budget > 0 && isOverBudget && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <span className="font-bold">Budget Overrun!</span> You have exceeded your monthly limit by {currencySymbol}{(totalExpense - budget).toFixed(2)}. Highly recommend halting additional expense entries.
                </div>
              </div>
            )}

            {budget > 0 && isNearLimit && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <span className="font-bold">High Budget Utilization!</span> You have consumed {usagePercent.toFixed(1)}% of your monthly allocation (exceeding the 80% caution threshold). Allocate remaining capital carefully.
                </div>
              </div>
            )}

            {/* Progress indicators */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400">Budget Progress</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {currencySymbol}{totalExpense.toFixed(2)} spent ({usagePercent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 dark:text-slate-500">Remaining Balance:</span>
            <span className={`font-mono font-bold text-sm ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {remaining >= 0 ? '' : '-'}{currencySymbol}{Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'Available' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Budget Insight Card (Right Column) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2 w-fit rounded-xl bg-white/10 backdrop-blur-md">
              <HelpCircle size={20} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base">The 50/30/20 Guideline</h3>
              <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed">
                If your monthly income is {currencySymbol}{ (transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) || 3000).toLocaleString(undefined, { maximumFractionDigits: 0 }) }:
              </p>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-indigo-200/60">50% Needs (Rent, Utilities):</span>
                <span className="font-semibold">{currencySymbol}{((transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) || 3000) * 0.5).toFixed(0)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-indigo-200/60">30% Wants (Shopping, Fun):</span>
                <span className="font-semibold">{currencySymbol}{((transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) || 3000) * 0.3).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-200/60">20% Savings (Goals, Debt):</span>
                <span className="font-semibold text-emerald-300">{currencySymbol}{((transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) || 3000) * 0.2).toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 text-[10px] text-indigo-300">
            * Adjust these percentages based on your specific financial situation.
          </div>
        </div>
      </div>

      {/* Spending Breakdown by Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
          <TrendingUp size={18} className="text-indigo-500" />
          Sector Spend Breakdown
        </h3>

        {categorySpending.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <Landmark size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium">No expenses recorded yet</p>
            <p className="text-xs mt-1">Expenses will automatically map into categories here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categorySpending.map((item) => (
              <div key={item.category} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{currencySymbol}{item.amount.toFixed(2)}</span>
                    <span className="text-slate-400">({item.percentage.toFixed(0)}% of expenses)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
