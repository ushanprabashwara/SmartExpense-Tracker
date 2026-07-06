import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BillReminder, EXPENSE_CATEGORIES, CURRENCIES } from '../types';

export const RemindersView: React.FC = () => {
  const { billReminders, addBillReminder, deleteBillReminder, toggleBillReminder, settings } = useApp();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billName, setBillName] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formError, setFormError] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  // Date threshold calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  const unpaidReminders = billReminders.filter(r => !r.isPaid);
  const paidReminders = billReminders.filter(r => r.isPaid);

  // Sorting unpaid into buckets
  const overdueBills = unpaidReminders.filter(r => {
    const due = new Date(r.dueDate);
    return due < todayDate && r.dueDate !== todayStr;
  }).sort((a,b) => a.dueDate.localeCompare(b.dueDate));

  const todayBills = unpaidReminders.filter(r => r.dueDate === todayStr);

  const thisWeekBills = unpaidReminders.filter(r => {
    const due = new Date(r.dueDate);
    const diffTime = due.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }).sort((a,b) => a.dueDate.localeCompare(b.dueDate));

  const futureBills = unpaidReminders.filter(r => {
    const due = new Date(r.dueDate);
    const diffTime = due.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }).sort((a,b) => a.dueDate.localeCompare(b.dueDate));

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!billName.trim()) {
      setFormError('Please enter a descriptive bill name.');
      return;
    }
    const amtVal = parseFloat(amount);
    if (isNaN(amtVal) || amtVal <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }
    if (!dueDate) {
      setFormError('Please select a valid due date.');
      return;
    }

    addBillReminder({
      name: billName.trim(),
      dueDate,
      amount: amtVal,
      category
    });

    setIsModalOpen(false);
    setBillName('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteReminder = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the bill reminder "${name}"?`)) {
      deleteBillReminder(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
            Bill Reminders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set alarms for recurring costs, pay dues timely, and avoid credit penalty rates.
          </p>
        </div>
        
        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/10 transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Bill Reminder
        </button>
      </div>

      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Overdue Bills</div>
            <div className="font-display font-bold text-base text-rose-600 mt-0.5">{overdueBills.length} Bill{overdueBills.length !== 1 && 's'} Pending</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-100 dark:border-amber-950/20 bg-amber-50/20 dark:bg-amber-950/5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Due Today / This Week</div>
            <div className="font-display font-bold text-base text-amber-600 mt-0.5">
              {todayBills.length + thisWeekBills.length} Bill{todayBills.length + thisWeekBills.length !== 1 && 's'} Pending
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20 dark:bg-emerald-950/5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Paid Bills History</div>
            <div className="font-display font-bold text-base text-emerald-600 mt-0.5">{paidReminders.length} Bill{paidReminders.length !== 1 && 's'} Settled</div>
          </div>
        </div>
      </div>

      {/* Bill Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unpaid / Pending Bills (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-display font-semibold text-base text-slate-800 dark:text-white">Dues & Subscriptions Queue</h2>

          {/* Overdue Section */}
          {overdueBills.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={14} /> Overdue Bills Requiring Attention
              </div>
              <div className="space-y-2">
                {overdueBills.map(r => (
                  <BillItemRow key={r.id} r={r} currencySymbol={currencySymbol} onDelete={handleDeleteReminder} onToggle={toggleBillReminder} overdue={true} />
                ))}
              </div>
            </div>
          )}

          {/* Today Section */}
          {todayBills.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <Clock size={14} /> Due Today
              </div>
              <div className="space-y-2">
                {todayBills.map(r => (
                  <BillItemRow key={r.id} r={r} currencySymbol={currencySymbol} onDelete={handleDeleteReminder} onToggle={toggleBillReminder} today={true} />
                ))}
              </div>
            </div>
          )}

          {/* This Week Section */}
          {thisWeekBills.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> Due This Week
              </div>
              <div className="space-y-2">
                {thisWeekBills.map(r => (
                  <BillItemRow key={r.id} r={r} currencySymbol={currencySymbol} onDelete={handleDeleteReminder} onToggle={toggleBillReminder} thisWeek={true} />
                ))}
              </div>
            </div>
          )}

          {/* Future Section */}
          {futureBills.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> Upcoming General Dues
              </div>
              <div className="space-y-2">
                {futureBills.map(r => (
                  <BillItemRow key={r.id} r={r} currencySymbol={currencySymbol} onDelete={handleDeleteReminder} onToggle={toggleBillReminder} />
                ))}
              </div>
            </div>
          )}

          {unpaidReminders.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 size={44} className="mx-auto mb-3 text-emerald-500/70" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Excellent! All Bills Settled</h3>
              <p className="text-xs max-w-sm mx-auto mb-4 leading-relaxed">
                You have zero pending reminders in your queue. Add recurring subscriptions to keep track.
              </p>
            </div>
          )}
        </div>

        {/* Paid / Settled Bills (Spans 1 column) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white mb-3">Settled Bill Logs</h3>
            {paidReminders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No bills paid yet this cycle. Check off bill boxes on the left to record.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {paidReminders.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 opacity-70">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={r.isPaid}
                        onChange={() => toggleBillReminder(r.id)}
                        className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Mark Unpaid"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 line-through truncate max-w-[100px]">{r.name}</h4>
                        <span className="text-[9px] text-slate-400">Paid: {r.dueDate}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 font-mono line-through">{currencySymbol}{r.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic">
            * Paid history clears automatically when resetting all local storage.
          </div>
        </div>

      </div>

      {/* Bill Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white">
                Add New Bill Reminder
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Bill Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Electricity, Netflix Subscription"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Bill Amount *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Bill Due Date *
                </label>
                <input 
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/10 transition-all cursor-pointer"
                >
                  Create Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Item Row Component
interface BillItemRowProps {
  r: BillReminder;
  currencySymbol: string;
  onDelete: (id: string, name: string) => void;
  onToggle: (id: string) => void;
  overdue?: boolean;
  today?: boolean;
  thisWeek?: boolean;
}

const BillItemRow: React.FC<BillItemRowProps> = ({ r, currencySymbol, onDelete, onToggle, overdue, today, thisWeek }) => {
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all hover:shadow-xs
      ${overdue 
        ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-900/30' 
        : today 
        ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/30'
        : thisWeek
        ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-100/60 dark:border-amber-900/20'
        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }
    `}>
      <div className="flex items-center gap-3">
        <input 
          type="checkbox"
          checked={r.isPaid}
          onChange={() => onToggle(r.id)}
          className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          title="Mark Paid"
        />
        
        <div>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.name}</h4>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            <span>{r.category}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className={`${overdue ? 'text-rose-600 font-semibold' : today ? 'text-amber-600 font-semibold' : ''}`}>
              Due: {r.dueDate} {overdue && '(Overdue)'} {today && '(Today)'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`font-mono text-xs font-bold ${overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {currencySymbol}{r.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onDelete(r.id, r.name)}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
          title="Remove"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
