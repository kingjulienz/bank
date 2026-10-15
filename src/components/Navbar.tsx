import React from 'react';
import { 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  LogOut, 
  User as UserIcon, 
  Target, 
  Plus, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { type User } from 'firebase/auth';
import { formatMonthYear, getCurrentYearMonth } from '../utils';

interface NavbarProps {
  user: User | null;
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenNewTransaction: () => void;
  onOpenBudgetModal: () => void;
  onSignOut: () => void;
  onLoadSampleData: () => void;
  onClearData: () => void;
  hasData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentMonth,
  onMonthChange,
  onOpenNewTransaction,
  onOpenBudgetModal,
  onSignOut,
  onLoadSampleData,
  onClearData,
  hasData,
}) => {
  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    let newM = m - 1;
    let newY = y;
    if (newM <= 0) {
      newM = 12;
      newY -= 1;
    }
    onMonthChange(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    let newM = m + 1;
    let newY = y;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    onMonthChange(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    onMonthChange(getCurrentYearMonth());
  };

  const isCurrentMonth = currentMonth === getCurrentYearMonth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
                  ระบบบันทึกรายรับ-รายจ่าย
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
                  Firebase Cloud
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">
                วิเคราะห์การเงินและสรุปผลรายเดือน
              </p>
            </div>
          </div>

          {/* Month Selector in Center */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
              title="คลิกเพื่อกลับไปเดือนปัจจุบัน"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">
                {formatMonthYear(currentMonth)}
              </span>
              {!isCurrentMonth && (
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md ml-1 font-semibold">
                  กลับ
                </span>
              )}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action buttons & User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick action buttons */}
            <button
              onClick={onOpenBudgetModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="ตั้งเป้าหมายงบประมาณ"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              <span>ตั้งงบประมาณ</span>
            </button>

            {/* Demo data shortcut */}
            {!hasData ? (
              <button
                onClick={onLoadSampleData}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                title="สร้างข้อมูลจำลองเพื่อดูภาพวิเคราะห์และกราฟ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>โหลดข้อมูลตัวอย่าง</span>
              </button>
            ) : (
              <button
                onClick={onClearData}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="ลบข้อมูลทั้งหมดที่บันทึกไว้เพื่อเริ่มต้นใหม่"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ตข้อมูล</span>
              </button>
            )}

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">เพิ่มรายการ</span>
            </button>

            {/* User Profile and Sign out */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-indigo-200 ring-2 ring-indigo-50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}

                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
