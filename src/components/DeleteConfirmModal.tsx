import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { type Transaction } from '../types';
import { formatCurrency, formatThaiDate } from '../utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: Transaction | null;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  loading = false,
}) => {
  if (!isOpen || !transaction) return null;

  const isExpense = transaction.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-slate-900">
            ยืนยันการลบรายการ
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            คุณต้องการลบรายการนี้ออกจากระบบใช่หรือไม่?
          </p>

          {/* Item details card */}
          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{transaction.category}</span>
              <span className={`font-black ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{formatThaiDate(transaction.date)}</span>
              {transaction.wallet && <span>{transaction.wallet}</span>}
            </div>
            {transaction.note && (
              <p className="text-[11px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60 italic truncate">
                "{transaction.note}"
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span>กำลังลบ...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันลบ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
