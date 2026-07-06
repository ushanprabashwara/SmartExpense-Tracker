import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Landmark, 
  PiggyBank, 
  BarChart3, 
  CalendarCheck2, 
  Settings, 
  Info,
  Menu,
  X,
  PlusCircle,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAdd: (type: 'income' | 'expense') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  const { settings, transactions, budget } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income Management', icon: Wallet },
    { id: 'expenses', label: 'Expense Management', icon: Receipt },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'budget', label: 'Budget Tracker', icon: Landmark },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'reminders', label: 'Bill Reminders', icon: CalendarCheck2 },
    { id: 'settings', label: 'Settings & Backups', icon: Settings },
    { id: 'about', label: 'About App', icon: Info },
  ];

  // Calculate current financial summaries
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800 shadow-sm transition-colors duration-200 text-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <PiggyBank size={20} />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            <span className="text-blue-500">Smart</span>Expense
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onQuickAdd('expense')}
            className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors"
            title="Quick Expense"
          >
            <PlusCircle size={20} />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#0F172A] text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand logo (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <PiggyBank size={24} />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="text-blue-500">Smart</span>Expense
            </span>
          </div>
        </div>

        {/* Small balance card in sidebar */}
        <div className="px-4 py-4 m-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Your Balance</div>
          <div className={`font-display font-semibold text-lg ${currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Budget: {currencySymbol}{budget}</span>
            <span>Used: {Math.round((totalExpense / (budget || 1)) * 100)}%</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-r-none rounded-l-xl transition-all duration-150 group
                  ${isActive 
                    ? 'bg-[#1E293B] text-blue-500 border-r-4 border-blue-500 pl-4' 
                    : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
                  }
                `}
              >
                <IconComponent 
                  size={18} 
                  className={`transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`} 
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Buttons (Sidebar Bottom) */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => onQuickAdd('expense')}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/10 transition-all cursor-pointer"
          >
            <PlusCircle size={14} />
            Quick Expense
          </button>
          <button
            onClick={() => onQuickAdd('income')}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 text-xs font-semibold text-blue-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle size={14} />
            Quick Income
          </button>
        </div>
      </aside>
    </>
  );
};
