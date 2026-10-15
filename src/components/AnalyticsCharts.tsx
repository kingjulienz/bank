import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import { type Transaction, type Budget } from '../types';
import { formatCurrency, formatMonthYear, formatThaiDate, getCategoryDetails, THAI_MONTHS_SHORT, getCurrentYearMonth } from '../utils';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  currentMonth: string;
  budget?: Budget;
  onSelectCategory?: (category: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  allTransactions,
  currentMonth,
  budget,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'daily' | 'trends'>('overview');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Month totals
  const { totalIncome, totalExpense, balance, savingsRate } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    const bal = inc - exp;
    const rate = inc > 0 ? Math.max(0, ((inc - exp) / inc) * 100) : 0;
    return { totalIncome: inc, totalExpense: exp, balance: bal, savingsRate: rate };
  }, [transactions]);

  // Expenses by Category
  const expenseCategories = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const prev = map.get(t.category) || { amount: 0, count: 0 };
        map.set(t.category, {
          amount: prev.amount + t.amount,
          count: prev.count + 1
        });
      });

    const total = Array.from(map.values()).reduce((sum, item) => sum + item.amount, 0);

    return Array.from(map.entries())
      .map(([cat, data]) => {
        const details = getCategoryDetails(cat, 'expense');
        return {
          category: cat,
          amount: data.amount,
          count: data.count,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          color: details.color,
          icon: details.icon
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Income by Category
  const incomeCategories = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const prev = map.get(t.category) || { amount: 0, count: 0 };
        map.set(t.category, {
          amount: prev.amount + t.amount,
          count: prev.count + 1
        });
      });

    const total = Array.from(map.values()).reduce((sum, item) => sum + item.amount, 0);

    return Array.from(map.entries())
      .map(([cat, data]) => {
        const details = getCategoryDetails(cat, 'income');
        return {
          category: cat,
          amount: data.amount,
          count: data.count,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          color: details.color,
          icon: details.icon
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [currentMonth]);

  // Daily Breakdown
  const dailyData = useMemo(() => {
    const days: { day: number; dateStr: string; income: number; expense: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayPad = String(d).padStart(2, '0');
      const dateStr = `${currentMonth}-${dayPad}`;
      days.push({ day: d, dateStr, income: 0, expense: 0 });
    }

    transactions.forEach(t => {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        if (t.type === 'income') {
          days[dayNum - 1].income += t.amount;
        } else {
          days[dayNum - 1].expense += t.amount;
        }
      }
    });

    return days;
  }, [transactions, currentMonth, daysInMonth]);

  // 6-Month Historical Trend
  const monthlyTrends = useMemo(() => {
    const [curYear, curMonth] = currentMonth.split('-').map(Number);
    const months: { key: string; label: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = curMonth - i;
      let y = curYear;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const label = `${THAI_MONTHS_SHORT[m - 1]} ${(y + 543) % 100}`;
      months.push({ key, label, income: 0, expense: 0 });
    }

    allTransactions.forEach(t => {
      const ym = t.date.substring(0, 7);
      const match = months.find(m => m.key === ym);
      if (match) {
        if (t.type === 'income') match.income += t.amount;
        else match.expense += t.amount;
      }
    });

    return months;
  }, [allTransactions, currentMonth]);

  // Financial Health Analysis
  const healthMetrics = useMemo(() => {
    // Days elapsed in the month for average
    const now = new Date();
    const isCurrentCalendarMonth = getCurrentYearMonth() === currentMonth;
    const daysPassed = isCurrentCalendarMonth ? Math.max(1, now.getDate()) : daysInMonth;
    const dailyAvgExpense = totalExpense / daysPassed;

    // Peak expense day
    let peakDay: { day: number; expense: number; dateStr: string } = { day: 0, expense: 0, dateStr: '' };
    dailyData.forEach(d => {
      if (d.expense > peakDay.expense) {
        peakDay = { day: d.day, expense: d.expense, dateStr: d.dateStr };
      }
    });

    // Top category
    const topCat = expenseCategories[0] || null;

    // Financial Status Rating
    let statusText = 'ปกติ';
    let statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
    let statusIcon = CheckCircle2;
    let tip = 'บันทึกรายรับรายจ่ายอย่างสม่ำเสมอเพื่อสุขภาพการเงินที่ดี';

    if (totalExpense > totalIncome && totalIncome > 0) {
      statusText = 'รายจ่ายเกินรายรับ';
      statusColor = 'text-rose-600 bg-rose-50 border-rose-200';
      statusIcon = AlertTriangle;
      tip = `รายจ่ายสูงกว่ารายรับ ฿${(totalExpense - totalIncome).toLocaleString()} ลองลดค่าใช้จ่ายในหมวด ${topCat?.category || 'ฟุ่มเฟือย'}`;
    } else if (savingsRate >= 30) {
      statusText = 'ยอดเยี่ยม (ออม > 30%)';
      statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      statusIcon = Award;
      tip = `คุณออมเงินได้ ${savingsRate.toFixed(1)}% ของรายรับ ทำได้ดีมาก! วางแผนนำเงินออมไปลงทุนต่อยอด`;
    } else if (savingsRate >= 10) {
      statusText = 'การเงินดี (ออม 10-30%)';
      statusColor = 'text-teal-600 bg-teal-50 border-teal-200';
      statusIcon = CheckCircle2;
      tip = 'มีการเก็บออมอย่างต่อเนื่อง รักษาวินัยการใช้จ่ายนี้ไว้';
    }

    return {
      dailyAvgExpense,
      peakDay,
      topCat,
      statusText,
      statusColor,
      statusIcon,
      tip,
      daysPassed
    };
  }, [totalExpense, totalIncome, savingsRate, dailyData, expenseCategories, currentMonth, daysInMonth]);

  // Donut Chart SVG Calculations
  interface DonutSegment {
    category: string;
    amount: number;
    count: number;
    percentage: number;
    color: string;
    icon: string;
    isFull: boolean;
    strokeWidth: number;
    cx?: number;
    cy?: number;
    r?: number;
    pathData?: string;
  }

  const donutPaths: DonutSegment[] = useMemo(() => {
    if (expenseCategories.length === 0) return [];
    let cumulativeAngle = 0;
    const radius = 80;
    const strokeWidth = 26;
    const center = 100;

    return expenseCategories.map(cat => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // In case full circle
      if (angle >= 359.9) {
        return {
          ...cat,
          isFull: true,
          cx: center,
          cy: center,
          r: radius,
          strokeWidth,
        };
      }

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
      ].join(' ');

      return {
        ...cat,
        isFull: false,
        pathData,
        strokeWidth,
      };
    });
  }, [expenseCategories]);

  const budgetProgress = useMemo(() => {
    if (!budget || budget.limitAmount <= 0) return null;
    const pct = (totalExpense / budget.limitAmount) * 100;
    const remaining = budget.limitAmount - totalExpense;
    return {
      limit: budget.limitAmount,
      spent: totalExpense,
      percentage: pct,
      remaining,
      isOver: remaining < 0,
      isWarning: pct >= 80 && pct <= 100
    };
  }, [budget, totalExpense]);

  const maxDailyValue = useMemo(() => {
    let max = 100;
    dailyData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [dailyData]);

  const maxTrendValue = useMemo(() => {
    let max = 100;
    monthlyTrends.forEach(m => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max;
  }, [monthlyTrends]);

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-slate-200/80 mb-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              ภาพวิเคราะห์ข้อมูล & สรุปประจำเดือน
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลทางการเงิน ประจำ {formatMonthYear(currentMonth)}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนหมวดหมู่
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายวัน
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trends'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แนวโน้ม 6 เดือน
          </button>
        </div>
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="pt-6 space-y-6">
          {/* Smart Financial Health Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${healthMetrics.statusColor} flex flex-col justify-between`}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">สถานะสุขภาพการเงิน</span>
                <div className="text-lg font-bold mt-1 flex items-center gap-1.5">
                  <healthMetrics.statusIcon className="w-5 h-5 shrink-0" />
                  <span>{healthMetrics.statusText}</span>
                </div>
              </div>
              <p className="text-xs mt-3 opacity-90 leading-relaxed font-normal">
                {healthMetrics.tip}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">เฉลี่ยรายจ่ายต่อวัน</span>
              <div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {formatCurrency(healthMetrics.dailyAvgExpense)}
                </div>
                <span className="text-[11px] text-slate-400">คำนวณจาก {healthMetrics.daysPassed} วันที่ผ่านมา</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">หมวดหมู่ใช้จ่ายสูงสุด</span>
              <div>
                <div className="text-base font-bold text-slate-800 mt-1 truncate">
                  {healthMetrics.topCat ? healthMetrics.topCat.category : '-'}
                </div>
                <span className="text-xs font-semibold text-rose-600">
                  {healthMetrics.topCat ? `${formatCurrency(healthMetrics.topCat.amount)} (${healthMetrics.topCat.percentage.toFixed(0)}%)` : 'ยังไม่มีรายจ่าย'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">วันที่จ่ายหนักที่สุด</span>
              <div>
                <div className="text-base font-bold text-slate-800 mt-1">
                  {healthMetrics.peakDay.expense > 0 ? formatThaiDate(healthMetrics.peakDay.dateStr) : '-'}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {healthMetrics.peakDay.expense > 0 ? `ยอดจ่าย ${formatCurrency(healthMetrics.peakDay.expense)}` : 'ไม่มีข้อมูล'}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Target Bar if set */}
          {budgetProgress && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  เป้าหมายควบคุมงบประมาณรายเดือน
                </span>
                <span>
                  ใช้ไปแล้ว {formatCurrency(budgetProgress.spent)} / {formatCurrency(budgetProgress.limit)}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetProgress.isOver
                      ? 'bg-rose-500'
                      : budgetProgress.isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetProgress.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={budgetProgress.isOver ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                  {budgetProgress.isOver
                    ? `⚠️ เกินงบไปแล้ว ${formatCurrency(Math.abs(budgetProgress.remaining))}`
                    : `เหลือใช้ได้อีก ${formatCurrency(budgetProgress.remaining)}`}
                </span>
                <span className="font-semibold text-slate-700">
                  {budgetProgress.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Split Charts: Donut + Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
                <PieChart className="w-4 h-4 text-indigo-500" />
                สัดส่วนค่าใช้จ่ายตามหมวดหมู่
              </h3>
              
              {expenseCategories.length > 0 ? (
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {donutPaths.map((item, idx) => {
                      if (item.isFull) {
                        return (
                          <circle
                            key={idx}
                            cx={item.cx}
                            cy={item.cy}
                            r={item.r}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={item.strokeWidth}
                            className="cursor-pointer transition-opacity hover:opacity-85"
                            onMouseEnter={() => setHoveredCategory(item.category)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onClick={() => onSelectCategory?.(item.category)}
                          />
                        );
                      }
                      return (
                        <path
                          key={idx}
                          d={item.pathData}
                          fill="none"
                          stroke={item.color}
                          strokeWidth={item.strokeWidth}
                          strokeLinecap="round"
                          className="cursor-pointer transition-all duration-200 hover:opacity-85"
                          style={{
                            transformOrigin: 'center',
                            filter: hoveredCategory === item.category ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none'
                          }}
                          onMouseEnter={() => setHoveredCategory(item.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => onSelectCategory?.(item.category)}
                        />
                      );
                    })}
                  </svg>

                  {/* Center info */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {hoveredCategory || 'รายจ่ายรวม'}
                    </span>
                    <span className="text-sm md:text-base font-bold text-slate-800">
                      {hoveredCategory
                        ? formatCurrency(expenseCategories.find(c => c.category === hoveredCategory)?.amount || 0)
                        : formatCurrency(totalExpense)}
                    </span>
                    {hoveredCategory && (
                      <span className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                        {expenseCategories.find(c => c.category === hoveredCategory)?.percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <PieChart className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                  ยังไม่มีรายการรายจ่ายในเดือนนี้
                </div>
              )}
            </div>

            {/* Top Categories Progress Bars */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                หมวดหมู่รายจ่ายยอดนิยม (คลิกเพื่อกรอง)
              </h3>
              {expenseCategories.length > 0 ? (
                expenseCategories.slice(0, 5).map(cat => (
                  <div
                    key={cat.category}
                    onClick={() => onSelectCategory?.(cat.category)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-700">{cat.category}</span>
                        <span className="text-[10px] text-slate-400">({cat.count} รายการ)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{formatCurrency(cat.amount)}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีข้อมูลรายจ่ายสำหรับสร้างสถิติ
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: CATEGORIES FULL BREAKDOWN */}
      {activeTab === 'categories' && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4" />
                รายจ่ายแยกตามหมวดหมู่ ({formatCurrency(totalExpense)})
              </h3>
              {expenseCategories.length > 0 ? (
                <div className="space-y-3">
                  {expenseCategories.map(c => (
                    <div key={c.category} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.category}
                        </span>
                        <span className="font-bold text-rose-600">{formatCurrency(c.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{c.count} รายการ</span>
                        <span>{c.percentage.toFixed(1)}% ของรายจ่ายทั้งหมด</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">ไม่มีข้อมูลรายจ่าย</p>
              )}
            </div>

            {/* Income Categories */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                รายรับแยกตามหมวดหมู่ ({formatCurrency(totalIncome)})
              </h3>
              {incomeCategories.length > 0 ? (
                <div className="space-y-3">
                  {incomeCategories.map(c => (
                    <div key={c.category} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.category}
                        </span>
                        <span className="font-bold text-emerald-600">{formatCurrency(c.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>{c.count} รายการ</span>
                        <span>{c.percentage.toFixed(1)}% ของรายรับทั้งหมด</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">ไม่มีข้อมูลรายรับ</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: DAILY BREAKDOWN BAR CHART */}
      {activeTab === 'daily' && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">กราฟแสดงรายรับ (เขียว) เทียบกับรายจ่าย (แดง) รายวันในเดือนนี้</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                รายรับ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                รายจ่าย
              </span>
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[640px] h-56 flex items-end gap-1.5 pt-8 px-2 border-b border-slate-200">
              {dailyData.map(item => {
                const incHeight = maxDailyValue > 0 ? (item.income / maxDailyValue) * 100 : 0;
                const expHeight = maxDailyValue > 0 ? (item.expense / maxDailyValue) * 100 : 0;
                const hasActivity = item.income > 0 || item.expense > 0;

                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] rounded-lg p-2 z-20 whitespace-nowrap shadow-lg">
                      <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                        {formatThaiDate(item.dateStr)}
                      </div>
                      <div className="text-emerald-400">รายรับ: {formatCurrency(item.income)}</div>
                      <div className="text-rose-400">รายจ่าย: {formatCurrency(item.expense)}</div>
                      <div className="text-slate-300 pt-0.5">คงเหลือ: {formatCurrency(item.income - item.expense)}</div>
                    </div>

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-40">
                      <div
                        className="w-1.5 md:w-2 bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-400"
                        style={{ height: `${Math.max(incHeight > 0 ? 4 : 0, incHeight)}%` }}
                      />
                      <div
                        className="w-1.5 md:w-2 bg-rose-500 rounded-t-sm transition-all duration-300 group-hover:bg-rose-400"
                        style={{ height: `${Math.max(expHeight > 0 ? 4 : 0, expHeight)}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[10px] mt-2 ${hasActivity ? 'font-bold text-slate-700' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 6-MONTH TRENDS */}
      {activeTab === 'trends' && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">แนวโน้มย้อนหลัง 6 เดือน (สถิติเปรียบเทียบรายได้และค่าใช้จ่าย)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                รายรับ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                รายจ่าย
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
            {monthlyTrends.map(m => {
              const diff = m.income - m.expense;
              const isSelected = m.key === currentMonth;

              return (
                <div
                  key={m.key}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200'
                      : 'border-slate-200/70 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">{m.label}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-medium">
                        เดือนนี้
                      </span>
                    )}
                  </div>

                  {/* Mini visual bars */}
                  <div className="space-y-1.5 my-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-emerald-700 mb-0.5">
                        <span>รับ</span>
                        <span className="font-semibold">{formatCurrency(m.income)}</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${maxTrendValue > 0 ? (m.income / maxTrendValue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-rose-700 mb-0.5">
                        <span>จ่าย</span>
                        <span className="font-semibold">{formatCurrency(m.expense)}</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${maxTrendValue > 0 ? (m.expense / maxTrendValue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">สุทธิ:</span>
                    <span className={`font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
