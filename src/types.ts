export type TransactionType = 'income' | 'expense';

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', color: '#10B981', icon: 'Briefcase', type: 'income' },
  { id: 'allowance', name: 'เงินค่าขนม / ผู้ปกครองให้', color: '#065F46', icon: 'GraduationCap', type: 'income' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', color: '#3B82F6', icon: 'Laptop', type: 'income' },
  { id: 'business', name: 'ค้าขาย / ธุรกิจส่วนตัว', color: '#8B5CF6', icon: 'Store', type: 'income' },
  { id: 'investment', name: 'เงินปันผล / กำไรลงทุน', color: '#EC4899', icon: 'TrendingUp', type: 'income' },
  { id: 'bonus', name: 'โบนัส / เงินรางวัล', color: '#F59E0B', icon: 'Award', type: 'income' },
  { id: 'transfer', name: 'เงินโอนรับ / คืนเงิน', color: '#14B8A6', icon: 'ArrowDownLeft', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', color: '#6B7280', icon: 'PlusCircle', type: 'income' },
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', color: '#EF4444', icon: 'Utensils', type: 'expense' },
  { id: 'education', name: 'การศึกษา / ค่าเทอม / อุปกรณ์เรียน', color: '#6366F1', icon: 'BookOpen', type: 'expense' },
  { id: 'transport', name: 'เดินทาง / น้ำมัน / รถไฟฟ้า', color: '#F97316', icon: 'Car', type: 'expense' },
  { id: 'housing', name: 'ที่พัก / ค่าหอ / ค่าเช่า', color: '#8B5CF6', icon: 'Home', type: 'expense' },
  { id: 'utilities', name: 'ค่าน้ำ-ไฟ / ค่าเน็ต / โทรศัพท์', color: '#06B6D4', icon: 'Zap', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง / เสื้อผ้า / ของใช้', color: '#EC4899', icon: 'ShoppingBag', type: 'expense' },
  { id: 'entertainment', name: 'ความบันเทิง / เกม / ปาร์ตี้', color: '#EAB308', icon: 'Gamepad2', type: 'expense' },
  { id: 'health', name: 'สุขภาพ / ยา / หาหมอ', color: '#14B8A6', icon: 'HeartPulse', type: 'expense' },
  { id: 'debt', name: 'หนี้สิน / ผ่อนชำระ / บัตร', color: '#DC2626', icon: 'CreditCard', type: 'expense' },
  { id: 'donation', name: 'ทำบุญ / ช่วยเหลือ / ของขวัญ', color: '#10B981', icon: 'Gift', type: 'expense' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', color: '#6B7280', icon: 'HelpCircle', type: 'expense' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const WALLET_OPTIONS = [
  { id: 'cash', name: 'เงินสด (Cash)', icon: 'Banknote' },
  { id: 'banking', name: 'โมบายแบงก์กิ้ง (Mobile Banking)', icon: 'Smartphone' },
  { id: 'promptpay', name: 'พร้อมเพย์ (PromptPay)', icon: 'QrCode' },
  { id: 'credit_card', name: 'บัตรเครดิต (Credit Card)', icon: 'CreditCard' },
  { id: 'ewallet', name: 'ทรูมันนี่ / E-Wallet', icon: 'Wallet' },
];

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  wallet: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  category: string; // 'total' or specific category name
  limitAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface DailySummary {
  date: string;
  dayNumber: number;
  income: number;
  expense: number;
  balance: number;
}
