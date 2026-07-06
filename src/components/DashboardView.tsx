import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Calendar, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, BillReminder, CURRENCIES } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onQuickAdd: (type: 'income' | 'expense') => void;
}

const FINANCIAL_TIPS = [
  "Aim to save 20% of your income. Consider adopting the 50/30/20 rule: 50% needs, 30% wants, and 20% savings.",
  "Check for unused recurring subscriptions. Canceling even one stream or gym pass can save you over $150/year.",
  "Build an emergency fund covering 3 to 6 months of living expenses in a high-yield savings account.",
  "Always wait 24 hours before making non-essential purchases to curb impulsive retail spending.",
  "Pay off high-interest debt first. It saves you the most money in interest charges over time.",
  "Track every expense, no matter how small. Small daily coffees can add up to over $1000 annually."
];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onQuickAdd }) => {
  const { 
    transactions, 
    billReminders, 
    savingsGoals, 
    budget, 
    settings,
    toggleBillReminder,
    exportToCSV
  } = useApp();

  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Rotate financial tips
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTipIndex(prev => (prev + 1) % FINANCIAL_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];
  const symbol = currency.symbol;

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Budget calculations
  const budgetUsagePercent = budget > 0 ? (totalExpense / budget) * 100 : 0;
  const remainingBudget = budget - totalExpense;

  // Savings progress
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavingsSaved = savingsGoals.reduce((sum, g) => sum + g.currentSavings, 0);
  const savingsProgressPercent = totalSavingsTarget > 0 ? (totalSavingsSaved / totalSavingsTarget) * 100 : 0;

  // Reminders due calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  const unpaidReminders = billReminders.filter(r => !r.isPaid);

  const billsDueToday = unpaidReminders.filter(r => r.dueDate === todayStr);
  const billsOverdue = unpaidReminders.filter(r => {
    const due = new Date(r.dueDate);
    return due < todayDate && r.dueDate !== todayStr;
  });
  const billsDueThisWeek = unpaidReminders.filter(r => {
    const due = new Date(r.dueDate);
    const diffTime = due.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  });

  // Recent transactions (max 5)
  const recentTransactions = transactions.slice(0, 5);

  // Generate spending insights
  const insights: { type: 'warning' | 'info' | 'success'; text: string }[] = [];
  
  if (budgetUsagePercent >= 80) {
    insights.push({
      type: 'warning',
      text: `Alert: You've consumed ${budgetUsagePercent.toFixed(1)}% of your monthly budget (${symbol}${totalExpense.toFixed(2)} out of ${symbol}${budget}). Consider restricting non-essential purchases.`
    });
  } else if (budgetUsagePercent >= 50) {
    insights.push({
      type: 'info',
      text: `Note: You have used ${budgetUsagePercent.toFixed(1)}% of your monthly budget. You have ${symbol}${remainingBudget.toFixed(2)} remaining.`
    });
  } else {
    insights.push({
      type: 'success',
      text: `Great: Your monthly spending is well controlled! You've used only ${budgetUsagePercent.toFixed(1)}% of your budget.`
    });
  }

  if (billsOverdue.length > 0) {
    insights.push({
      type: 'warning',
      text: `Overdue Payment: You have ${billsOverdue.length} overdue bill${billsOverdue.length > 1 ? 's' : ''} needing attention!`
    });
  }

  if (totalIncome > 0 && totalExpense > 0) {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        text: `Superb: Your current savings rate is ${savingsRate.toFixed(1)}% of your income, exceeding the recommended 20% benchmark!`
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'info',
        text: `Info: You're saving ${savingsRate.toFixed(1)}% of your monthly income. Aim for 20% to accelerate your savings goals.`
      });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here is your real-time financial health summary.
          </p>
        </div>
        
        {/* Quick Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="http://ushanprabashwara.github.io/My-Portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
          >
            <ArrowRight size={14} /> UP. - Portfolio
          </a>
          <button
            onClick={() => onQuickAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Add Expense
          </button>
          <button
            onClick={() => onQuickAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Add Income
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          TO CHANGE THE CURRENCY, PLEASE GO TO SETTINGS AND SELECT YOUR PREFERRED OPTION.
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          PLEASE USE THIS APPLICATION USING A SINGLE BROWSER (E.G., CHROME OR EDGE).
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Balance card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Balance</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className={`font-display font-bold text-2xl lg:text-3xl ${currentBalance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {symbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp size={12} className={currentBalance >= 0 ? "text-emerald-500" : "text-rose-500 rotate-180"} />
            Total assets after monthly cashflow
          </p>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white">
            {symbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            Salary, freelance, and other streams
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white">
            {symbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-medium">
            Food, rent, leisure, and utilities
          </p>
        </div>

        {/* Budget Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Budget Limit</span>
            <div className={`p-1.5 rounded-lg text-xs font-semibold ${budgetUsagePercent >= 80 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'}`}>
              {budgetUsagePercent.toFixed(0)}% Used
            </div>
          </div>
          <div className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white">
            {symbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">left of {symbol}{budget}</span>
          </div>
          
          {/* Animated Budget Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${budgetUsagePercent >= 80 ? 'bg-rose-500' : budgetUsagePercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Spending Insights & Tips Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Insights (Left Column) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
              <AlertCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
              Smart Spending Insights
            </h3>
            
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed transition-all
                    ${insight.type === 'warning' 
                      ? 'bg-rose-50/60 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400' 
                      : insight.type === 'success' 
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-blue-50/60 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400'
                    }
                  `}
                >
                  {insight.type === 'warning' && <AlertTriangle size={15} className="mt-0.5 shrink-0" />}
                  {insight.type === 'success' && <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
                  {insight.type === 'info' && <Lightbulb size={15} className="mt-0.5 shrink-0" />}
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Savings Goals overview in insights box */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <PiggyBank size={14} className="text-emerald-500" />
                Aggregate Savings Progress
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{savingsProgressPercent.toFixed(0)}% ({symbol}{totalSavingsSaved} / {symbol}{totalSavingsTarget})</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                style={{ width: `${Math.min(savingsProgressPercent, 100)}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Financial Tips Carousel (Right Column) */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 text-white shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                <Lightbulb size={16} className="text-amber-300" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                Financial Tip
              </span>
            </div>
            
            <div className="min-h-[100px] flex items-center">
              <p className="font-sans text-sm font-medium leading-relaxed italic text-slate-300 animate-fade-in" key={activeTipIndex}>
                "{FINANCIAL_TIPS[activeTipIndex]}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <span className="text-slate-400">Tip {activeTipIndex + 1} of {FINANCIAL_TIPS.length}</span>
            <button 
              onClick={() => setActiveTipIndex(prev => (prev + 1) % FINANCIAL_TIPS.length)}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors group cursor-pointer"
            >
              Next Tip <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Reminders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Recent Transactions Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">Recent Transactions</h3>
            <button 
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500">
              <Receipt size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">No transactions logged yet</p>
              <p className="text-xs mt-1">Add income or expenses to populate your history.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 px-1 rounded-lg transition-all">
                  <div className="flex items-center gap-3">
                    {/* Category circle color representation */}
                    <div className={`p-2 rounded-xl text-xs font-semibold leading-none
                      ${tx.type === 'income' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }
                    `}>
                      <span className="font-mono text-[10px] uppercase font-bold">{tx.category.substring(0, 3)}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{tx.title}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{tx.date}</span>
                        {tx.paymentMethod && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>{tx.paymentMethod}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={`font-mono text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{symbol}{tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bill Reminders Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white">Bill Reminders</h3>
              {unpaidReminders.length > 0 && (
                <p className="text-[11px] text-rose-500 font-medium mt-0.5">
                  {unpaidReminders.length} pending bill{unpaidReminders.length > 1 ? 's' : ''} due soon
                </p>
              )}
            </div>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Manage Reminders <ArrowRight size={12} />
            </button>
          </div>

          {billReminders.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500">
              <Calendar size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">No bill reminders set</p>
              <p className="text-xs mt-1">Set reminders for subscriptions and utilities.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[295px] overflow-y-auto pr-1">
              {billReminders.slice(0, 5).map((reminder) => {
                const isOverdue = new Date(reminder.dueDate) < todayDate && reminder.dueDate !== todayStr && !reminder.isPaid;
                const isDueToday = reminder.dueDate === todayStr && !reminder.isPaid;
                
                return (
                  <div 
                    key={reminder.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all
                      ${reminder.isPaid 
                        ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/60 opacity-60' 
                        : isOverdue 
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
                        : isDueToday
                        ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox to quick pay */}
                      <input 
                        type="checkbox"
                        checked={reminder.isPaid}
                        onChange={() => toggleBillReminder(reminder.id)}
                        className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                        title={reminder.isPaid ? "Mark unpaid" : "Mark as Paid"}
                      />
                      
                      <div>
                        <h4 className={`text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 ${reminder.isPaid ? 'line-through text-slate-400' : ''}`}>
                          {reminder.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          <span>{reminder.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className={`font-semibold ${isOverdue ? 'text-rose-500 font-bold' : isDueToday ? 'text-amber-500' : ''}`}>
                            Due: {reminder.dueDate} {isOverdue && '(Overdue)'} {isDueToday && '(Today)'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-mono text-xs font-semibold ${reminder.isPaid ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {symbol}{reminder.amount.toFixed(2)}
                      </div>
                      {!reminder.isPaid && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider
                          ${isOverdue 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                            : isDueToday 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }
                        `}>
                          {isOverdue ? 'Overdue' : isDueToday ? 'Today' : 'Upcoming'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
