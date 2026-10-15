import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle2 } from 'lucide-react';
import { type Budget } from '../types';
import { formatCurrency, formatMonthYear } from '../utils';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (limitAmount: number) => Promise<void>;
  currentMonth: string;
  existingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMonth,
  existingBudget,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBudget && existingBudget.limitAmount > 0) {
      setAmount(existingBudget.limitAmount.toString());
    } else {
      setAmount('');
    }
    setError(null);
  }, [existingBudget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      setError('กรุณาระบุงบประมาณที่ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(num);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                ตั้งเป้าหมายงบประมาณรายเดือน
              </h3>
              <p className="text-xs text-slate-400">
                ประจำ {formatMonthYear(currentMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              งบประมาณรายจ่ายสูงสุดในเดือนนี้ (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="เช่น 8000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-extrabold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Quick preset chips */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[5000, 8000, 10000, 15000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * ระบบจะช่วยแจ้งเตือนความคืบหน้าการใช้เงิน หากใช้จ่ายใกล้ถึงหรือเกินงบประมาณ
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
