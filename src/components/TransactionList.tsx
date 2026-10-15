import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar, 
  Wallet, 
  Tag, 
  AlertCircle 
} from 'lucide-react';
import { type Transaction, type TransactionType, ALL_CATEGORIES } from '../types';
import { formatCurrency, formatThaiDate, getCategoryDetails, exportTransactionsToCSV } from '../utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onLoadSampleData: () => void;
  selectedCategoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  onLoadSampleData,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // In-app modal deletion state (avoids window.confirm blocked in iframes)
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync external category filter if passed from chart click
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNote = (t.note || '').toLowerCase().includes(query);
        const matchCat = (t.category || '').toLowerCase().includes(query);
        const matchWallet = (t.wallet || '').toLowerCase().includes(query);
        if (!matchNote && !matchCat && !matchWallet) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    sorted.forEach(t => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });

    return Array.from(map.entries()).map(([dateStr, items]) => {
      const dayIncome = items.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0);
      const dayExpense = items.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
      return {
        dateStr,
        items,
        dayIncome,
        dayExpense,
      };
    });
  }, [filteredTransactions]);

  const confirmDeleteAction = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(itemToDelete.id);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, `financial-statement-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-slate-200/80">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            รายการบันทึกรายรับ - รายจ่าย ({filteredTransactions.length} รายการ)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ประวัติการทำรายการ สามารถแก้ไขหรือลบรายการได้ตลอดเวลา
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="ส่งออกเป็นไฟล์ CSV (Excel)"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            + บันทึกรายการ
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 py-4 border-b border-slate-100">
        {/* Search Input */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามบันทึก, หมวดหมู่, ช่องทางชำระ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="sm:col-span-4 flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              typeFilter === 'income'
                ? 'bg-emerald-500 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายรับ
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`flex-1 py-1 text-center rounded-lg transition-all ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายจ่าย
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              if (e.target.value === 'all') onClearCategoryFilter?.();
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map(c => (
              <option key={c.id} value={c.name}>
                {c.type === 'income' ? '🟢' : '🔴'} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Category Filter Tag if set */}
      {categoryFilter !== 'all' && (
        <div className="flex items-center gap-2 pt-3 pb-1">
          <span className="text-xs text-slate-500">กรองเฉพาะหมวดหมู่:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Tag className="w-3 h-3" />
            {categoryFilter}
            <button
              onClick={() => {
                setCategoryFilter('all');
                onClearCategoryFilter?.();
              }}
              className="ml-1 text-indigo-400 hover:text-indigo-700"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* List items */}
      <div className="pt-4 space-y-6">
        {groupedByDate.length > 0 ? (
          groupedByDate.map(group => (
            <div key={group.dateStr} className="space-y-2">
              {/* Date Header with Daily Subtotal */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  {formatThaiDate(group.dateStr)}
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 font-medium">
                      + {formatCurrency(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 font-medium">
                      - {formatCurrency(group.dayExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction cards for this date */}
              <div className="space-y-2">
                {group.items.map(item => {
                  const details = getCategoryDetails(item.category, item.type);
                  const isExpense = item.type === 'expense';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all gap-2"
                    >
                      {/* Left: Category color & details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: `${details.color}15`,
                            color: details.color,
                          }}
                        >
                          {isExpense ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {item.category}
                            </span>
                            {item.wallet && (
                              <span className="hidden sm:inline-flex items-center text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/70">
                                {item.wallet}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {item.note || '-'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Action buttons */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                        <span
                          className={`text-sm sm:text-base font-extrabold tracking-tight ${
                            isExpense ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(item.amount)}
                        </span>

                        {/* Always visible, distinct action buttons */}
                        <div className="flex items-center gap-1 ml-1 sm:ml-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                            title="แก้ไขรายการนี้"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline text-[11px]">แก้ไข</span>
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline text-[11px]">ลบ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'
                : 'ยังไม่มีข้อมูลรายการบันทึกในเดือนนี้'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'
                : 'เริ่มต้นบันทึกรายรับหรือรายจ่ายแรกของคุณ หรือกดโหลดข้อมูลตัวอย่างเพื่อทดสอบระบบ'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onAddNew}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                + บันทึกรายการใหม่
              </button>
              {transactions.length === 0 && (
                <button
                  onClick={onLoadSampleData}
                  className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                >
                  ⚡ โหลดข้อมูลตัวอย่าง
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeleteAction}
        transaction={itemToDelete}
        loading={isDeleting}
      />
    </div>
  );
};
