import React, { useState } from 'react';
import { 
  Plus, 
  PiggyBank, 
  Trash2, 
  Edit3, 
  X, 
  Award,
  PlusCircle,
  TrendingUp,
  Info,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingsGoal, CURRENCIES } from '../types';

export const SavingsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, settings } = useApp();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [formError, setFormError] = useState('');

  // Quick contribute state
  const [quickGoalId, setQuickGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  // Calculations
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentSavings, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoals = savingsGoals.filter(g => g.completed).length;

  const openAddModal = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('');
    setCurrentSavings('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentSavings(goal.currentSavings.toString());
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!goalName.trim()) {
      setFormError('Please enter a descriptive goal name.');
      return;
    }
    const targetVal = parseFloat(targetAmount);
    if (isNaN(targetVal) || targetVal <= 0) {
      setFormError('Target amount must be a positive number.');
      return;
    }
    const currentVal = parseFloat(currentSavings || '0');
    if (isNaN(currentVal) || currentVal < 0) {
      setFormError('Current savings must be zero or a positive number.');
      return;
    }
    if (currentVal > targetVal) {
      setFormError('Current savings cannot exceed the target amount.');
      return;
    }

    const goalData = {
      name: goalName.trim(),
      targetAmount: targetVal,
      currentSavings: currentVal
    };

    if (editingGoal) {
      updateSavingsGoal({
        ...editingGoal,
        ...goalData
      });
    } else {
      addSavingsGoal(goalData);
    }

    setIsModalOpen(false);
  };

  const handleQuickContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGoalId) return;

    const goal = savingsGoals.find(g => g.id === quickGoalId);
    const amt = parseFloat(contributeAmount);

    if (goal && !isNaN(amt) && amt > 0) {
      const updatedSavings = Math.min(goal.currentSavings + amt, goal.targetAmount);
      updateSavingsGoal({
        ...goal,
        currentSavings: updatedSavings
      });
      setQuickGoalId(null);
      setContributeAmount('');
    }
  };

  const handleDeleteGoal = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the savings goal "${name}"?`)) {
      deleteSavingsGoal(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define savings milestones, allocate cash, and celebrate your completions.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/10 transition-all cursor-pointer"
        >
          <Plus size={16} /> New Savings Goal
        </button>
      </div>

      {/* Aggregate Savings Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Target Capital</span>
            <div className="font-display font-bold text-2xl text-slate-800 dark:text-white">
              {currencySymbol}{totalTarget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Saved Accumulation</span>
            <div className="font-display font-bold text-2xl text-emerald-600 dark:text-emerald-400">
              {currencySymbol}{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completions</span>
            <div className="font-display font-bold text-2xl text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Award size={20} className="text-indigo-500" />
              {completedGoals} / {savingsGoals.length} Goals
            </div>
          </div>
        </div>

        {/* Aggregated Progress bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">Global Progress Meter</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{overallProgress.toFixed(0)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Goals */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center text-slate-400 dark:text-slate-500">
          <PiggyBank size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Set Your First Savings Goal</h3>
          <p className="text-xs max-w-sm mx-auto mb-4 leading-relaxed">
            Whether saving for a new laptop, a travel vacation, or building an emergency fund, track your milestones here.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savingsGoals.map((goal) => {
            const goalProgressPercent = goal.targetAmount > 0 ? (goal.currentSavings / goal.targetAmount) * 100 : 0;
            const isCompleted = goal.completed;

            return (
              <div 
                key={goal.id} 
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col justify-between transition-all relative overflow-hidden group
                  ${isCompleted 
                    ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/5 dark:bg-emerald-950/5' 
                    : 'border-slate-200/80 dark:border-slate-800'
                  }
                `}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl 
                        ${isCompleted 
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' 
                          : 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400'
                        }
                      `}>
                        <PiggyBank size={18} />
                      </div>
                      <div>
                        <h3 className={`font-display font-semibold text-sm text-slate-800 dark:text-white line-clamp-1 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                          {goal.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Created: {goal.dateCreated}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        title="Edit Goal"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id, goal.name)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-800 rounded-lg transition-all cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Financial numbers */}
                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Amount Saved:</span>
                    <div className="font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {currencySymbol}{goal.currentSavings.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-slate-400"> / {currencySymbol}{goal.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(goalProgressPercent, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Completion Percent:</span>
                      <span className={`font-semibold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        {goalProgressPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick contribute action */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                      <Award size={14} /> Goal Accomplished!
                    </div>
                  ) : quickGoalId === goal.id ? (
                    <form onSubmit={handleQuickContribute} className="flex items-center gap-1.5 w-full animate-fade-in">
                      <input 
                        type="number"
                        min="1"
                        required
                        placeholder="Amt"
                        value={contributeAmount}
                        onChange={(e) => setContributeAmount(e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickGoalId(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs py-1"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setQuickGoalId(goal.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <PlusCircle size={13} /> Quick Deposit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white">
                {editingGoal ? 'Modify Savings Target' : 'Define New Savings Goal'}
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

            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Goal Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dream Laptop, Trip to Bali"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Target Capital *
                  </label>
                  <input 
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 2500"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Initial Savings
                  </label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
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
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
