import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Coins, 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    getBackupJSON, 
    restoreFromJSON, 
    clearAllData 
  } = useApp();

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    updateSettings({ currency });
    triggerStatus('success', `Default currency updated to ${currency}.`);
  };

  const triggerStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Create JSON file and download
  const handleBackup = () => {
    try {
      const jsonStr = getBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart_expense_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerStatus('success', 'Local storage state backup JSON downloaded successfully.');
    } catch (e) {
      triggerStatus('error', 'Failed to generate backup file.');
    }
  };

  // Upload JSON file and restore
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreFromJSON(content);
      if (success) {
        triggerStatus('success', 'Financial database state restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        triggerStatus('error', 'Malformed JSON file. Restore aborted.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    if (confirm('CRITICAL WARNING: This will permanently wipe all transactions, savings goals, bill reminders, and settings. This operation is irreversible. Do you wish to continue?')) {
      clearAllData();
      triggerStatus('success', 'All local data was successfully cleared.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalize your layout views, manage system currencies, and download ledger backups.
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in
          ${statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
          }
        `}>
          {statusMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <Settings size={18} className="text-indigo-500" /> General Preferences
          </h2>

          {/* Currency dropdown */}
          <div className="space-y-2">
            <label htmlFor="currency-select" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Primary Currency Metric
            </label>
            <div className="relative">
              <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
              <select
                id="currency-select"
                value={settings.currency}
                onChange={handleCurrencyChange}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                {CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol}) — {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Administration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <Trash2 size={18} className="text-rose-500" /> Data Administration
          </h2>

          {/* Action Row */}
          <div className="space-y-3">
            {/* Backup JSON */}
            <button
              onClick={handleBackup}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
                  <Download size={15} />
                </div>
                <span>Backup database as JSON</span>
              </div>
              <span className="text-[10px] text-slate-400">Download config string</span>
            </button>

            {/* Restore JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500">
                  <Upload size={15} />
                </div>
                <span>Restore database from JSON file</span>
              </div>
              <span className="text-[10px] text-slate-400">Select .json file</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleRestoreFile} 
              accept=".json" 
              className="hidden" 
            />

            {/* Reset All */}
            <button
              onClick={handleResetAll}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-rose-100 dark:border-rose-950/20 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500">
                  <Trash2 size={15} />
                </div>
                <span>Clear all stored local sessions</span>
              </div>
              <span className="text-[10px] text-rose-400 font-bold uppercase">Reset Storage</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
