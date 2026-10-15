import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { type Transaction, type Budget, type UserProfile } from '../types';
import { getCurrentYearMonth, getTodayDateString } from '../utils';

// Upsert User Profile
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    const userRef = doc(db, 'users', profile.userId);
    await setDoc(userRef, {
      userId: profile.userId,
      email: profile.email,
      displayName: profile.displayName || '',
      photoURL: profile.photoURL || '',
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to Transactions
export function subscribeToTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/transactions`;
  const q = collection(db, 'users', userId, 'transactions');

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const list: Transaction[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId || userId,
          type: d.type,
          amount: Number(d.amount) || 0,
          category: d.category || '',
          date: d.date || '',
          note: d.note || '',
          wallet: d.wallet || '',
          createdAt: d.createdAt || '',
          updatedAt: d.updatedAt || '',
        });
      });
      onData(list);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );

  return unsubscribe;
}

// Add Transaction
export async function createTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const collectionPath = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const now = new Date().toISOString();
    const docRef = await addDoc(colRef, {
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      date: data.date,
      note: data.note || '',
      wallet: data.wallet || '',
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

// Update Transaction
export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Delete Transaction
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to Budgets
export function subscribeToBudgets(
  userId: string,
  onData: (budgets: Budget[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionPath = `users/${userId}/budgets`;
  const q = collection(db, 'users', userId, 'budgets');

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const list: Budget[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: d.userId || userId,
          month: d.month || '',
          category: d.category || 'total',
          limitAmount: Number(d.limitAmount) || 0,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });
      });
      onData(list);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    }
  );

  return unsubscribe;
}

// Set Budget for Month
export async function saveMonthlyBudget(
  userId: string,
  month: string,
  limitAmount: number
): Promise<void> {
  const docId = `budget_${month}_total`;
  const docPath = `users/${userId}/budgets/${docId}`;
  try {
    const docRef = doc(db, 'users', userId, 'budgets', docId);
    const now = new Date().toISOString();
    await setDoc(docRef, {
      userId,
      month,
      category: 'total',
      limitAmount,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Seed Sample Data for instant demonstration & visualization
export async function seedSampleFinanceData(userId: string): Promise<void> {
  const currentYM = getCurrentYearMonth();
  const [y, m] = currentYM.split('-');
  const year = parseInt(y, 10);
  const month = parseInt(m, 10);

  // Helper date generator
  const createDate = (day: number, offsetMonth: number = 0) => {
    let targetM = month - offsetMonth;
    let targetY = year;
    while (targetM <= 0) {
      targetM += 12;
      targetY -= 1;
    }
    const dayStr = String(Math.min(28, Math.max(1, day))).padStart(2, '0');
    const monthStr = String(targetM).padStart(2, '0');
    return `${targetY}-${monthStr}-${dayStr}`;
  };

  const sampleItems: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = [
    // Current month Income
    { type: 'income', amount: 15000, category: 'เงินค่าขนม / ผู้ปกครองให้', date: createDate(1), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าใช้จ่ายประจำเดือนจากที่บ้าน' },
    { type: 'income', amount: 3500, category: 'งานเสริม / ฟรีแลนซ์', date: createDate(5), wallet: 'พร้อมเพย์ (PromptPay)', note: 'รับทำสไลด์และกราฟิกนำเสนอ' },
    { type: 'income', amount: 1200, category: 'ค้าขาย / ธุรกิจส่วนตัว', date: createDate(12), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ขายเสื้อผ้ามือสอง' },
    { type: 'income', amount: 2000, category: 'เงินเดือน / ค่าจ้าง', date: createDate(14), wallet: 'พร้อมเพย์ (PromptPay)', note: 'สอนพิเศษวิชาภาษาอังกฤษ' },

    // Current month Expenses
    { type: 'expense', amount: 4500, category: 'ที่พัก / ค่าหอ / ค่าเช่า', date: createDate(2), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าหอพักนักศึกษา' },
    { type: 'expense', amount: 650, category: 'ค่าน้ำ-ไฟ / ค่าเน็ต / โทรศัพท์', date: createDate(3), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าน้ำ+ไฟหอพัก' },
    { type: 'expense', amount: 890, category: 'การศึกษา / ค่าเทอม / อุปกรณ์เรียน', date: createDate(4), wallet: 'ทรูมันนี่ / E-Wallet', note: 'ซื้อหนังสือเรียนและชีทสรุป' },
    { type: 'expense', amount: 120, category: 'อาหารและเครื่องดื่ม', date: createDate(5), wallet: 'พร้อมเพย์ (PromptPay)', note: 'ข้าวราดแกงโรงอาหาร + กาแฟ' },
    { type: 'expense', amount: 65, category: 'เดินทาง / น้ำมัน / รถไฟฟ้า', date: createDate(6), wallet: 'เงินสด (Cash)', note: 'รถสองแถว + วินมอเตอร์ไซค์' },
    { type: 'expense', amount: 250, category: 'อาหารและเครื่องดื่ม', date: createDate(7), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ก๋วยเตี๋ยวเรือมื้อเย็น' },
    { type: 'expense', amount: 490, category: 'ช้อปปิ้ง / เสื้อผ้า / ของใช้', date: createDate(8), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ซื้อของใช้เข้าห้อง สบู่ ยาสระผม' },
    { type: 'expense', amount: 150, category: 'อาหารและเครื่องดื่ม', date: createDate(9), wallet: 'พร้อมเพย์ (PromptPay)', note: 'ข้าวกะเพราหมูกรอบไข่ดาว' },
    { type: 'expense', amount: 350, category: 'ความบันเทิง / เกม / ปาร์ตี้', date: createDate(10), wallet: 'ทรูมันนี่ / E-Wallet', note: 'เติมเหรียญเกม + ดูหนัง' },
    { type: 'expense', amount: 80, category: 'เดินทาง / น้ำมัน / รถไฟฟ้า', date: createDate(11), wallet: 'เงินสด (Cash)', note: 'ค่าบีทีเอสไปทำรายงาน' },
    { type: 'expense', amount: 320, category: 'อาหารและเครื่องดื่ม', date: createDate(12), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ชาบูมื้อเย็นกับเพื่อนร่วมรุ่น' },
    { type: 'expense', amount: 180, category: 'สุขภาพ / ยา / หาหมอ', date: createDate(13), wallet: 'เงินสด (Cash)', note: 'ซื้อยาแก้แพ้และวิตามินซี' },

    // Past month 1 (last month)
    { type: 'income', amount: 15000, category: 'เงินค่าขนม / ผู้ปกครองให้', date: createDate(1, 1), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'เงินสนับสนุนรายเดือน' },
    { type: 'income', amount: 4000, category: 'งานเสริม / ฟรีแลนซ์', date: createDate(15, 1), wallet: 'พร้อมเพย์ (PromptPay)', note: 'ออกแบบโปสเตอร์อีเวนต์' },
    { type: 'expense', amount: 4500, category: 'ที่พัก / ค่าหอ / ค่าเช่า', date: createDate(2, 1), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าหอพัก' },
    { type: 'expense', amount: 720, category: 'ค่าน้ำ-ไฟ / ค่าเน็ต / โทรศัพท์', date: createDate(3, 1), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าไฟเดือนก่อน' },
    { type: 'expense', amount: 3200, category: 'อาหารและเครื่องดื่ม', date: createDate(10, 1), wallet: 'เงินสด (Cash)', note: 'รวมค่าอาหารตลอดสัปดาห์' },
    { type: 'expense', amount: 1500, category: 'การศึกษา / ค่าเทอม / อุปกรณ์เรียน', date: createDate(18, 1), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าอุปกรณ์แล็ป' },

    // Past month 2
    { type: 'income', amount: 15000, category: 'เงินค่าขนม / ผู้ปกครองให้', date: createDate(1, 2), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'เงินสนับสนุนรายเดือน' },
    { type: 'expense', amount: 4500, category: 'ที่พัก / ค่าหอ / ค่าเช่า', date: createDate(2, 2), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ค่าหอพัก' },
    { type: 'expense', amount: 2800, category: 'อาหารและเครื่องดื่ม', date: createDate(12, 2), wallet: 'เงินสด (Cash)', note: 'ค่ากินอยู่' },
    { type: 'expense', amount: 950, category: 'ช้อปปิ้ง / เสื้อผ้า / ของใช้', date: createDate(20, 2), wallet: 'โมบายแบงก์กิ้ง (Mobile Banking)', note: 'ชุดนักศึกษาใหม่' },
  ];

  // Insert items in batch
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  sampleItems.forEach(item => {
    const colRef = collection(db, 'users', userId, 'transactions');
    const newDoc = doc(colRef);
    batch.set(newDoc, {
      userId,
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  });

  // Also set a default recommended student budget of 12,000 THB for current month
  const budgetRef = doc(db, 'users', userId, 'budgets', `budget_${currentYM}_total`);
  batch.set(budgetRef, {
    userId,
    month: currentYM,
    category: 'total',
    limitAmount: 12000,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  await batch.commit();
}

// Clear all user transactions for reset
export async function clearAllUserTransactions(userId: string): Promise<void> {
  const colRef = collection(db, 'users', userId, 'transactions');
  const snap = await getDocs(colRef);
  const batch = writeBatch(db);
  snap.forEach(d => {
    batch.delete(d.ref);
  });
  await batch.commit();
}
