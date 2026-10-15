import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { 
  auth, 
  logOut, 
  testConnection 
} from './firebase';
import { 
  type Transaction, 
  type Budget, 
  type UserProfile 
} from './types';
import { 
  subscribeToTransactions, 
  subscribeToBudgets, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  saveMonthlyBudget, 
  seedSampleFinanceData, 
  clearAllUserTransactions, 
  syncUserProfile 
} from './services/transactionService';
import { getCurrentYearMonth } from './utils';

import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentYearMonth());
  
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Filter state linked to charts
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Test connection on initial app load as mandated by skill
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Sync profile to firestore
        try {
          await syncUserProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
            photoURL: currentUser.photoURL || undefined,
          });
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setAllTransactions([]);
        setBudgets([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to User Transactions & Budgets
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubTransactions = subscribeToTransactions(
      user.uid,
      items => {
        setAllTransactions(items);
        setDataLoading(false);
      },
      error => {
        console.error('Transactions subscription error:', error);
        showToast('เกิดข้อผิดพลาดในการโหลดรายการข้อมูล', 'error');
        setDataLoading(false);
      }
    );

    const unsubBudgets = subscribeToBudgets(
      user.uid,
      items => {
        setBudgets(items);
      },
      error => {
        console.error('Budgets subscription error:', error);
      }
    );

    return () => {
      unsubTransactions();
      unsubBudgets();
    };
  }, [user]);

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => t.date && t.date.startsWith(currentMonth));
  }, [allTransactions, currentMonth]);

  // Current month budget
  const currentBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonth && b.category === 'total') || null;
  }, [budgets, currentMonth]);

  // Month totals
  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    monthTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [monthTransactions]);

  // Handlers
  const handleSignOut = async () => {
    try {
      await logOut();
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('ไม่สามารถออกจากระบบได้', 'error');
    }
  };

  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    if (editingTransaction) {
      await updateTransaction(user.uid, editingTransaction.id, data);
      showToast('แก้ไขรายการสำเร็จ');
    } else {
      await createTransaction(user.uid, data);
      showToast('บันทึกรายการสำเร็จ');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteTransaction(user.uid, id);
      showToast('ลบรายการเรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('ไม่สามารถลบรายการได้', 'error');
    }
  };

  const handleSaveBudget = async (limitAmount: number) => {
    if (!user) return;
    try {
      await saveMonthlyBudget(user.uid, currentMonth, limitAmount);
      showToast('บันทึกเป้าหมายงบประมาณเรียบร้อยแล้ว');
    } catch (err: any) {
      showToast('ไม่สามารถบันทึกงบประมาณได้', 'error');
    }
  };

  const handleLoadSampleData = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      await seedSampleFinanceData(user.uid);
      showToast('สร้างข้อมูลตัวอย่างพร้อมกราฟวิเคราะห์สำเร็จแล้ว');
    } catch (err: any) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleConfirmReset = async () => {
    if (!user) return;
    try {
      setResetLoading(true);
      await clearAllUserTransactions(user.uid);
      showToast('รีเซ็ตข้อมูลทั้งหมดเรียบร้อยแล้ว');
      setIsResetModalOpen(false);
    } catch (err: any) {
      showToast('ไม่สามารถรีเซ็ตข้อมูลได้', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">
          กำลังเตรียมระบบ Firebase Cloud...
        </p>
      </div>
    );
  }

  // Unauthenticated: Show Login Landing Screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-16 font-['Prompt',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navbar with Month Selector & Profile */}
      <Navbar
        user={user}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onSignOut={handleSignOut}
        onLoadSampleData={handleLoadSampleData}
        onClearData={() => setIsResetModalOpen(true)}
        hasData={allTransactions.length > 0}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {dataLoading && allTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 my-8 shadow-xs">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              กำลังเชื่อมต่อฐานข้อมูล Firestore (Project: bank-303fd)...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Monthly Summary Cards */}
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              budget={currentBudget}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />

            {/* 2. Visual Analytics & Charts Section (ภาพวิเคราะห์ข้อมูล และสรุปผลรายเดือน) */}
            <AnalyticsCharts
              transactions={monthTransactions}
              allTransactions={allTransactions}
              currentMonth={currentMonth}
              budget={currentBudget || undefined}
              onSelectCategory={cat => setSelectedCategoryFilter(cat)}
            />

            {/* 3. Transaction Records List */}
            <TransactionList
              transactions={monthTransactions}
              onEdit={item => {
                setEditingTransaction(item);
                setIsTransactionModalOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onLoadSampleData={handleLoadSampleData}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
            />
          </>
        )}
      </main>

      {/* Modal: New / Edit Transaction */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Modal: Monthly Budget Target */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentMonth={currentMonth}
        existingBudget={currentBudget}
      />

      {/* Modal: Reset All Data Confirmation */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ยืนยันการรีเซ็ตข้อมูลทั้งหมด
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              คุณต้องการลบรายการธุรกรรมทั้งหมดเพื่อเริ่มต้นใหม่ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={resetLoading}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetLoading}
                className="py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {resetLoading ? 'กำลังรีเซ็ต...' : 'ยืนยันลบทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
