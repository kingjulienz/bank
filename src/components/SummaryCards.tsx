import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  PiggyBank, 
  Target,
  Sparkles 
} from 'lucide-react';
import { type Budget } from '../types';
import { formatCurrency } from '../utils';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  budget?: Budget | null;
  onOpenBudgetModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  budget,
  onOpenBudgetModal,
}) => {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;

  const budgetLimit = budget?.limitAmount || 0;
  const budgetSpent = totalExpense;
  const budgetRemaining = budgetLimit - budgetSpent;
  const budgetPct = budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">
            รายรับรวม (Total Income)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(totalIncome)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
          <span>+ แหล่งรายได้ประจำเดือน</span>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">
            รายจ่ายรวม (Total Expense)
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(totalExpense)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-600">
          <span>
            {totalIncome > 0
              ? `${((totalExpense / totalIncome) * 100).toFixed(0)}% ของรายรับ`
              : 'ยอดจ่ายทั้งหมด'}
          </span>
        </div>
      </div>

      {/* 3. Net Balance */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${balance >= 0 ? 'bg-indigo-500/5' : 'bg-rose-500/5'} rounded-bl-full pointer-events-none transition-all group-hover:scale-110`} />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">
            คงเหลือสุทธิ (Net Balance)
          </span>
          <div className={`w-9 h-9 rounded-xl ${balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-black tracking-tight ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
          {balance >= 0 ? (
            <span className="text-emerald-600 font-semibold">สถานะบวก (มีเงินเก็บ)</span>
          ) : (
            <span className="text-rose-600 font-semibold">สถานะติดลบ (ใช้เกินรายรับ)</span>
          )}
        </div>
      </div>

      {/* 4. Budget / Savings Rate */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 relative overflow-hidden group">
        {budgetLimit > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">
                งบประมาณคงเหลือ (Budget)
              </span>
              <button
                onClick={onOpenBudgetModal}
                className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                title="แก้ไขงบประมาณ"
              >
                <Target className="w-5 h-5" />
              </button>
            </div>
            <div className={`text-xl sm:text-2xl font-black tracking-tight ${budgetRemaining < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatCurrency(budgetRemaining)}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetRemaining < 0
                    ? 'bg-rose-500'
                    : budgetPct >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetPct)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
              <span>งบ {formatCurrency(budgetLimit)}</span>
              <span className="font-bold text-slate-600">{budgetPct.toFixed(0)}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">
                อัตราการออม (Savings Rate)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500 font-normal">
                {savingsRate >= 20 ? 'อัตราการออมอยู่ในเกณฑ์ดี' : 'ตั้งเป้าหมายงบประมาณเพื่อควบคุม'}
              </span>
              <button
                onClick={onOpenBudgetModal}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
              >
                ตั้งงบ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
