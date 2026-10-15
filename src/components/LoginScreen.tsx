import React, { useState } from 'react';
import { 
  Wallet, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Cloud, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onLoginSuccess?.();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
              ระบบจัดการรายรับ-รายจ่าย
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              Smart Financial Management
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>เข้าสู่ระบบ</span>
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
          <Cloud className="w-3.5 h-3.5" />
          <span>เชื่อมต่อข้อมูลบนระบบคลาวด์ Firebase ปลอดภัย สะดวกทุกที่</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          จัดการรายรับ - รายจ่าย <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            พร้อมภาพวิเคราะห์ข้อมูลและกราฟสรุปรายเดือน
          </span>
        </h2>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          บันทึกยอดเงินเข้า-ออก สรุปสถิติประจำเดือน เปรียบเทียบรายได้และค่าใช้จ่าย 
          วิเคราะห์สัดส่วนการเงินด้วยกราฟวงกลมและแผนภูมิแท่งรายวัน เข้าใช้งานง่ายด้วยบัญชี Gmail ของคุณ
        </p>

        {error && (
          <div className="max-w-md mx-auto mt-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-left">
            {error}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-md hover:shadow-lg rounded-2xl transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Gmail (Google)'}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-16 text-left">
          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              ภาพวิเคราะห์ข้อมูลเชิงลึก
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              เห็นสัดส่วนการใช้จ่ายแยกตามหมวดหมู่ กราฟเปรียบเทียบรายวัน และแนวโน้ม 6 เดือน
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              สรุปผลและควบคุมงบประมาณ
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              คำนวณเงินออมสุทธิ เฉลี่ยรายวัน และตั้งเป้าหมายงบประมาณเพื่อควบคุมค่าใช้จ่าย
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              ความปลอดภัยมาตรฐานคลาวด์
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              จัดเก็บข้อมูลใน Firestore แบบเข้ารหัสเฉพาะบุคคล พร้อมเข้าสู่ระบบสะดวกรวดเร็ว
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        ระบบบันทึกรายรับ-รายจ่าย • Firebase Cloud Platform • เข้าสู่ระบบด้วย Gmail อย่างปลอดภัย
      </footer>
    </div>
  );
};
