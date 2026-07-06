import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '../types';
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Wallet, ArrowDownCircle } from 'lucide-react';

const CHART_COLORS = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#a855f7'  // purple
];

export const ReportsView: React.FC = () => {
  const { transactions, settings, budget } = useApp();

  const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

  // Calculations
  const incomeList = transactions.filter(t => t.type === 'income');
  const expenseList = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0);

  // 1. Income vs Expense Overall Data
  const summaryData = [
    { name: 'Income', amount: totalIncome, fill: '#10b981' },
    { name: 'Expenses', amount: totalExpense, fill: '#f43f5e' }
  ];

  // 2. Expense Category Distribution
  const expenseCategoryData = EXPENSE_CATEGORIES.map(category => {
    const amount = expenseList
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category, value: parseFloat(amount.toFixed(2)) };
  }).filter(item => item.value > 0);

  // 3. Income Source Distribution
  const incomeCategoryData = INCOME_CATEGORIES.map(category => {
    const amount = incomeList
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category, value: parseFloat(amount.toFixed(2)) };
  }).filter(item => item.value > 0);

  // 4. Daily Spending Trend (Line Chart)
  // Get all unique dates in transactions sorted, or generate last 10 days
  const dates = Array.from(new Set(transactions.map(t => t.date))).sort();
  const trendData = dates.map(date => {
    const income = incomeList.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0);
    const expense = expenseList.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0);
    return {
      date,
      Income: parseFloat(income.toFixed(2)),
      Expenses: parseFloat(expense.toFixed(2))
    };
  }).slice(-10); // Show last 10 transaction dates for clean layout

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-slate-800 dark:text-white tracking-tight">
          Financial Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          In-depth data visualizations of your cash inflows, category expenditures, and monthly metrics.
        </p>
      </div>

      {/* Main summary values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
            <Wallet size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Cash Flow In</div>
            <div className="font-display font-bold text-lg text-slate-800 dark:text-white mt-0.5">{currencySymbol}{totalIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600">
            <ArrowDownCircle size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Debit Out</div>
            <div className="font-display font-bold text-lg text-slate-800 dark:text-white mt-0.5">{currencySymbol}{totalExpense.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Savings Margin Rate</div>
            <div className="font-display font-bold text-lg text-slate-800 dark:text-white mt-0.5">
              {totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(0) : '0'}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cashflow Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <BarChart3 size={16} className="text-emerald-500" />
            Cash Flow Allocation
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${parseFloat(value).toLocaleString()}`, 'Amount']} 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Velocity Trend Line */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <LineIcon size={16} className="text-blue-500" />
            Spending & Income Velocity (Last 10 Log Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${value}`, '']} 
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Doughnut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <PieIcon size={16} className="text-rose-500" />
            Expense Category Allocations
          </h3>
          {expenseCategoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <PieIcon size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
              <span>No expense records logged</span>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col sm:flex-row items-center gap-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${currencySymbol}${value}`, 'Total']} 
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="w-1/2 max-h-[220px] overflow-y-auto space-y-2 text-xs">
                {expenseCategoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[80px]" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white font-mono">{currencySymbol}{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Income Sources Breakdown Doughnut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <PieIcon size={16} className="text-indigo-500" />
            Income Stream Sources
          </h3>
          {incomeCategoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <PieIcon size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
              <span>No income records logged</span>
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col sm:flex-row items-center gap-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomeCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${currencySymbol}${value}`, 'Total']} 
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="w-1/2 max-h-[220px] overflow-y-auto space-y-2 text-xs">
                {incomeCategoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[80px]" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white font-mono">{currencySymbol}{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
