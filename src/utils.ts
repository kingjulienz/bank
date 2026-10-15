import { ALL_CATEGORIES, type Transaction, type TransactionType } from './types';

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount)) return '฿0';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonthYear(yearMonth: string): string {
  // yearMonth: "2026-10"
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const thaiYear = year + 543;
  return `${THAI_MONTHS[month]} ${thaiYear} (${year})`;
}

export function formatThaiDate(dateStr: string): string {
  // dateStr: "2026-10-15"
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const thaiYear = year + 543;
  return `${day} ${THAI_MONTHS_SHORT[month]} ${thaiYear}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCategoryDetails(categoryName: string, type?: TransactionType) {
  const found = ALL_CATEGORIES.find(c => c.name === categoryName || c.id === categoryName);
  if (found) return found;

  return {
    id: 'unknown',
    name: categoryName || 'ทั่วไป',
    color: type === 'income' ? '#10B981' : '#EF4444',
    icon: type === 'income' ? 'TrendingUp' : 'Tag',
    type: type || 'expense'
  };
}

// Export to CSV helper
export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'transactions.csv') {
  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'วิธีชำระ/บัญชี', 'บันทึกช่วยจำ'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${(t.wallet || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
