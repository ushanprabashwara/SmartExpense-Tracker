import React, { useState } from 'react';
import { 
  Info, 
  Code, 
  Layers, 
  User, 
  Download, 
  CheckCircle, 
  Terminal,
  ExternalLink,
  PiggyBank
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = () => {
    setDownloading(true);
    setDownloadSuccess(false);
    
    // Download zip served from public folder or workspace root
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '/SmartExpenseTracker.zip';
      link.download = 'SmartExpenseTracker.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
          About Personal Expense Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Project overview, structural architecture, used software tooling, and distribution packages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Profile (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <Info size={18} className="text-emerald-500" /> Project Objective
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The <strong>Smart Personal Expense Tracker</strong> is an offline-first, client-side personal finance solution designed to empower users to manage their cashflow. By tracking incomes and expenses, implementing active monthly budgets, tracking savings milestones, and alerting about upcoming utility bill deadlines, users can gain full awareness of their spending behaviors.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All financial data is securely serialized directly in the client's local browser storage. There is no background data collection, no database subscription fees, and no sensitive cloud accounts required, making the application extremely private and 100% compliant with static host platforms like GitHub Pages.
            </p>
          </div>

          {/* Technical Specs */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Layers size={18} className="text-indigo-500" /> Core Tech Stacks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* React Tech Stack */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Live Environment (React)</span>
                <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">• React 19 (Functional Components)</li>
                  <li className="flex items-center gap-1.5">• Vite 6 Development Server</li>
                  <li className="flex items-center gap-1.5">• Tailwind CSS v4 Styles</li>
                  <li className="flex items-center gap-1.5">• Recharts Interactive SVG Charts</li>
                  <li className="flex items-center gap-1.5">• Lucide React SVG Library</li>
                </ul>
              </div>

              {/* Bootstrap Tech Stack */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px] block">Static ZIP Build (HTML/Bootstrap)</span>
                <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">• Standard Semantic HTML5</li>
                  <li className="flex items-center gap-1.5">• Bootstrap 5.3 CDN Stylesheet</li>
                  <li className="flex items-center gap-1.5">• Modular ES6 Native JavaScript</li>
                  <li className="flex items-center gap-1.5">• Chart.js CDN Canvas Charts</li>
                  <li className="flex items-center gap-1.5">• Bootstrap Icons CDN Font</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards (Developer profile + ZIP Package Download) */}
        <div className="space-y-6">
          {/* Developer Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <User size={18} className="text-blue-500" /> Developer Profile
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold font-display">
                UP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Ushan Prabashwara</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Undergraduate IT Portfolio Project</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono font-semibold">1.2.0-stable</span>
              </div>
              <div className="flex justify-between">
                <span>Release Date:</span>
                <span className="font-mono">July 2026</span>
              </div>
              <div className="flex justify-between">
                <span>License:</span>
                <span className="font-semibold text-emerald-500">Apache 2.0</span>
              </div>
            </div>

            <a
              href="http://ushanprabashwara.github.io/My-Portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
            >
              <ExternalLink size={14} /> UP. - Portfolio
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
