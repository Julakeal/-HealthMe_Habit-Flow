import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Check, Plus, Trash2, Flame, Trophy, Calendar, 
  TrendingUp, Award, Sparkles, RefreshCw, ChevronLeft, 
  ChevronRight, CheckCircle2, BarChart3, Sun, Moon, 
  AlertCircle, X, Crown, Key, Download, Upload, 
  FileSpreadsheet, FileJson, ShieldCheck, Lock, Unlock,
  CheckCircle, Sparkle, ExternalLink, HelpCircle, Copy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell 
} from 'recharts';

// --- ค่าคงที่และข้อมูลเริ่มต้น (Constants & Default Data) ---
const FREE_HABIT_LIMIT = 3;

const VALID_DEMO_KEYS = [
  'HABIT-PRO-2026',
  'PRO-VIP-999',
  'PRO-LIFETIME-888'
];

const CATEGORIES = [
  { id: 'all', name: 'ทั้งหมด', color: 'bg-slate-600', text: 'text-slate-600', border: 'border-slate-600', light: 'bg-slate-100' },
  { id: 'health', name: 'สุขภาพ & กีฬา', color: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500', light: 'bg-emerald-50', hex: '#10b981' },
  { id: 'mind', name: 'จิตใจ & สมาธิ', color: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-500', light: 'bg-purple-50', hex: '#a855f7' },
  { id: 'learning', name: 'การเรียนรู้', color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500', light: 'bg-blue-50', hex: '#3b82f6' },
  { id: 'work', name: 'งาน & วินัย', color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500', light: 'bg-amber-50', hex: '#f59e0b' },
];

const EMOJI_LIST = ['💧', '🏃‍♂️', '📚', '🧘‍♀️', '🥗', '💤', '💻', '🎸', '📝', '💊', '🧹', '💰', '🚫🍬', '🌅'];

const QUOTES = [
  "ความสำเร็จคือผลรวมของความพยายามเล็กๆ ที่ทำซ้ำๆ ทุกวัน",
  "เราเป็นในสิ่งที่เราทำซ้ำๆ ความเป็นเลิศจึงไม่ใช่การกระทำ แต่เป็นนิสัย",
  "เริ่มต้นในที่ที่คุณอยู่ ใช้สิ่งที่คุณมี และทำในสิ่งที่คุณทำได้",
  "วินัยคือสะพานเชื่อมระหว่างเป้าหมายและความสำเร็จ",
  "การเปลี่ยนแปลงเล็กๆ น้อยๆ ในทุกวัน นำไปสู่ผลลัพธ์ที่ยิ่งใหญ่ในระยะยาว"
];

// ฟังก์ชันช่วยจัดการวันที่แบบ Local (YYYY-MM-DD)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// สร้างข้อมูลจำลองเริ่มต้น 3 รายการ (พอดีกับโควต้า Free Tier เพื่อให้ผู้ใช้กดเพิ่มรายการที่ 4 แล้วเจอ Paywall ทันที)
const generateInitialHabits = () => {
  const today = new Date();
  const getPastDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return getLocalDateString(d);
  };

  return [
    {
      id: 'h1',
      name: 'ดื่มน้ำวันละ 8 แก้ว',
      category: 'health',
      icon: '💧',
      targetDaysPerWeek: 7,
      completedDates: {
        [getPastDate(6)]: true,
        [getPastDate(5)]: true,
        [getPastDate(4)]: true,
        [getPastDate(3)]: true,
        [getPastDate(2)]: true,
        [getPastDate(1)]: true,
        [getPastDate(0)]: true,
      }
    },
    {
      id: 'h2',
      name: 'อ่านหนังสือพัฒนาตัวเอง 30 นาที',
      category: 'learning',
      icon: '📚',
      targetDaysPerWeek: 5,
      completedDates: {
        [getPastDate(6)]: true,
        [getPastDate(4)]: true,
        [getPastDate(3)]: true,
        [getPastDate(2)]: true,
        [getPastDate(1)]: true,
      }
    },
    {
      id: 'h3',
      name: 'ออกกำลังกาย / วิ่งจ๊อกกิ้ง',
      category: 'health',
      icon: '🏃‍♂️',
      targetDaysPerWeek: 4,
      completedDates: {
        [getPastDate(5)]: true,
        [getPastDate(3)]: true,
        [getPastDate(1)]: true,
        [getPastDate(0)]: true,
      }
    }
  ];
};

export default function App() {
  // --- States หลัก ---
  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('thai_habit_tracker_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load habits from LocalStorage', e);
    }
    return generateInitialHabits();
  });

  // สถานะสมาชิก PRO & License Key
  const [licenseInfo, setLicenseInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('thai_habit_license_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load license from LocalStorage', e);
    }
    return { isPro: false, key: '', activatedAt: null };
  });

  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [weekOffset, setWeekOffset] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ฟอร์มเพิ่มนิสัยใหม่
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('health');
  const [newHabitIcon, setNewHabitIcon] = useState('💧');
  const [newHabitTarget, setNewHabitTarget] = useState(7);

  // ฟอร์มกรอก License Key
  const [inputLicenseKey, setInputLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('lifetime'); // 'lifetime' | 'yearly'

  // ระบบ Toast แจ้งเตือนมุมจอ
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // บันทึกข้อมูลนิสัยลง LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('thai_habit_tracker_v2', JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  }, [habits]);

  // บันทึกสถานะ PRO ลง LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('thai_habit_license_v2', JSON.stringify(licenseInfo));
    } catch (e) {
      console.error('Failed to save license', e);
    }
  }, [licenseInfo]);

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const isPro = licenseInfo.isPro;
  const isQuotaReached = !isPro && habits.length >= FREE_HABIT_LIMIT;

  // --- การคำนวณวันในสัปดาห์ (จันทร์ - อาทิตย์) ---
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (weekOffset * 7));

    const days = [];
    const thaiShortDays = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    const thaiFullDays = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      days.push({
        dateObj: d,
        dateStr,
        dayNumber: d.getDate(),
        shortName: thaiShortDays[i],
        fullName: thaiFullDays[i],
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr
      });
    }
    return days;
  }, [weekOffset, todayStr]);

  // --- ฟังก์ชันคำนวณ Streak ---
  const calculateStreak = (completedDates) => {
    if (!completedDates) return 0;
    let streak = 0;
    const today = new Date();
    const todayKey = getLocalDateString(today);
    let checkDate = new Date(today);
    
    if (!completedDates[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = getLocalDateString(checkDate);
      if (completedDates[key]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // --- ฟังก์ชันจัดการนิสัยและการตรวจสอบโควต้า ---
  const handleOpenAddHabit = () => {
    if (isQuotaReached) {
      setLicenseError('');
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const toggleHabitDate = (habitId, dateStr) => {
    if (dateStr > todayStr) return;

    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const updatedDates = { ...h.completedDates };
      if (updatedDates[dateStr]) {
        delete updatedDates[dateStr];
      } else {
        updatedDates[dateStr] = true;
      }
      return { ...h, completedDates: updatedDates };
    }));
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    if (!isPro && habits.length >= FREE_HABIT_LIMIT) {
      setIsAddModalOpen(false);
      setIsUpgradeModalOpen(true);
      return;
    }

    const newHabit = {
      id: 'h_' + Date.now(),
      name: newHabitName.trim(),
      category: newHabitCategory,
      icon: newHabitIcon,
      targetDaysPerWeek: Number(newHabitTarget),
      completedDates: {}
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setIsAddModalOpen(false);
    showToast(`เพิ่มนิสัย "${newHabit.name}" เรียบร้อยแล้ว!`);
  };

  const handleDeleteHabit = (id) => {
    const target = habits.find(h => h.id === id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setDeleteConfirmId(null);
    if (target) showToast(`ลบนิสัย "${target.name}" แล้ว`, 'info');
  };

  const handleResetDemoData = () => {
    const initial = generateInitialHabits();
    setHabits(initial);
    setWeekOffset(0);
    setResetConfirmOpen(false);
    showToast('รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้นเรียบร้อยแล้ว');
  };

  // --- ระบบตรวจสอบและเปิดใช้งาน License Key ---
  const handleActivateLicense = (e) => {
    e.preventDefault();
    const cleanedKey = inputLicenseKey.trim().toUpperCase();
    
    if (!cleanedKey) {
      setLicenseError('กรุณากรอกรหัส License Key ของคุณ');
      return;
    }

    // ตรวจสอบรหัส: รองรับรหัสในรายการทดสอบ หรือรหัสใดๆ ที่ขึ้นต้นด้วย PRO- และยาวตั้งแต่ 8 ตัวอักษรขึ้นไป
    const isValid = VALID_DEMO_KEYS.includes(cleanedKey) || (cleanedKey.startsWith('PRO-') && cleanedKey.length >= 8);

    if (isValid) {
      setLicenseInfo({
        isPro: true,
        key: cleanedKey,
        activatedAt: new Date().toISOString()
      });
      setLicenseError('');
      setInputLicenseKey('');
      setIsUpgradeModalOpen(false);
      showToast('🎉 เปิดใช้งานรุ่น PRO สำเร็จ! ปลดล็อกขีดจำกัดทั้งหมดแล้ว');
    } else {
      setLicenseError('รหัส License Key ไม่ถูกต้อง กรุณาตรวจสอบหรือใช้รหัสทดสอบด้านล่าง');
    }
  };

  const handleToggleDevProMode = () => {
    if (isPro) {
      setLicenseInfo({ isPro: false, key: '', activatedAt: null });
      showToast('สลับเป็นสถานะผู้ใช้ฟรี (Free Tier: จำกัด 3 นิสัย)', 'info');
    } else {
      setLicenseInfo({
        isPro: true,
        key: 'DEV-MODE-PRO',
        activatedAt: new Date().toISOString()
      });
      showToast('👑 สลับเป็นสถานะ PRO VIP สำหรับทดสอบแล้ว!');
    }
  };

  // --- ระบบสำรองและกู้คืนข้อมูล (Export JSON / Export CSV / Import JSON) ---
  const handleExportJSON = () => {
    try {
      const backupPayload = {
        app: 'HabitFlow_Backup',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        licenseInfo,
        habits
      };
      const dataStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `habitflow-backup-${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('ดาวน์โหลดไฟล์สำรองข้อมูล (.json) สำเร็จ!');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการสร้างไฟล์สำรองข้อมูล', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!isPro) {
      setIsBackupModalOpen(false);
      setIsUpgradeModalOpen(true);
      showToast('การส่งออกรายงาน Excel (.csv) สำหรับสมาชิก PRO เท่านั้น', 'info');
      return;
    }

    try {
      // สร้างหัวตาราง CSV (ใส่ BOM \uFEFF เพื่อให้ Excel อ่านภาษาไทยไม่ต่างดาว)
      const headers = [
        'ลำดับ',
        'ไอคอน',
        'ชื่อนิสัย',
        'หมวดหมู่',
        'เป้าหมายต่อสัปดาห์ (วัน)',
        'ทำสำเร็จสัปดาห์นี้ (วัน)',
        'สถิติทำต่อเนื่องปัจจุบัน (วัน)',
        'จำนวนวันที่เช็คอินสะสมทั้งหมด (วัน)',
        ...currentWeekDays.map(d => `${d.shortName} (${d.dateStr})`)
      ];

      const rows = habits.map((h, idx) => {
        const catName = CATEGORIES.find(c => c.id === h.category)?.name || h.category;
        const streak = calculateStreak(h.completedDates);
        const totalCompletedAllTime = Object.keys(h.completedDates || {}).length;
        const weekCount = currentWeekDays.filter(d => h.completedDates?.[d.dateStr]).length;
        const dailyChecks = currentWeekDays.map(d => (h.completedDates?.[d.dateStr] ? '1' : '0'));

        return [
          idx + 1,
          h.icon,
          `"${h.name.replace(/"/g, '""')}"`,
          `"${catName}"`,
          h.targetDaysPerWeek,
          weekCount,
          streak,
          totalCompletedAllTime,
          ...dailyChecks
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `habitflow-report-${todayStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('ส่งออกรายงานสถิติ (.csv) สำหรับเปิดใน Excel สำเร็จ!');
    } catch (err) {
      showToast('ไม่สามารถส่งออกไฟล์ CSV ได้', 'error');
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // รองรับทั้งรูปแบบไฟล์ที่มี object ห่อหุ้ม (backupPayload) หรือ array ของ habits โดยตรง
        const importedHabits = Array.isArray(parsed) ? parsed : parsed.habits;

        if (!Array.isArray(importedHabits)) {
          throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');
        }

        // ตรวจสอบความสมบูรณ์ของข้อมูลแต่ละรายการเบื้องต้น
        const validHabits = importedHabits.filter(item => item && typeof item.name === 'string' && item.id);
        if (validHabits.length === 0 && importedHabits.length > 0) {
          throw new Error('ไม่พบข้อมูลนิสัยที่ถูกต้องในไฟล์นี้');
        }

        setHabits(validHabits);

        // หากในไฟล์สำรองมีข้อมูล License PRO ติดมาด้วย ให้กู้คืนให้ด้วย
        if (parsed.licenseInfo && parsed.licenseInfo.isPro) {
          setLicenseInfo(parsed.licenseInfo);
        }

        setIsBackupModalOpen(false);
        showToast(`กู้คืนข้อมูลสำเร็จ! นำเข้าทั้งหมด ${validHabits.length} รายการ`);
      } catch (err) {
        showToast('ไฟล์ไม่ถูกต้อง! กรุณาอัปโหลดไฟล์ .json ที่ได้จากการสำรองข้อมูลของ HabitFlow', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- ข้อมูลสถิติและกราฟ (Analytics & Charts Data) ---
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter(h => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  const todayStats = useMemo(() => {
    const total = habits.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = habits.filter(h => h.completedDates?.[todayStr]).length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }, [habits, todayStr]);

  const weeklyChartData = useMemo(() => {
    return currentWeekDays.map(day => {
      let completedCount = 0;
      filteredHabits.forEach(h => {
        if (h.completedDates?.[day.dateStr]) completedCount++;
      });
      const totalHabits = filteredHabits.length;
      const rate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

      return {
        name: day.shortName,
        fullName: `${day.fullName}ที่ ${day.dayNumber}`,
        completed: completedCount,
        total: totalHabits,
        rate: rate,
        isToday: day.isToday
      };
    });
  }, [currentWeekDays, filteredHabits]);

  const habitPerformanceData = useMemo(() => {
    return filteredHabits.map(h => {
      let weekCompleted = 0;
      currentWeekDays.forEach(day => {
        if (h.completedDates?.[day.dateStr]) weekCompleted++;
      });
      const streak = calculateStreak(h.completedDates);
      const catInfo = CATEGORIES.find(c => c.id === h.category) || CATEGORIES[0];
      const progressPercent = Math.min(100, Math.round((weekCompleted / h.targetDaysPerWeek) * 100));

      return {
        ...h,
        weekCompleted,
        streak,
        catInfo,
        progressPercent
      };
    });
  }, [filteredHabits, currentWeekDays]);

  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => calculateStreak(h.completedDates)));
  }, [habits]);

  const weeklyOverallRate = useMemo(() => {
    if (habitPerformanceData.length === 0) return 0;
    const totalDone = habitPerformanceData.reduce((acc, cur) => acc + cur.weekCompleted, 0);
    const totalTarget = habitPerformanceData.reduce((acc, cur) => acc + cur.targetDaysPerWeek, 0);
    return totalTarget > 0 ? Math.min(100, Math.round((totalDone / totalTarget) * 100)) : 0;
  }, [habitPerformanceData]);

  const thaiDateHeader = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const weekRangeLabel = useMemo(() => {
    if (currentWeekDays.length === 0) return '';
    const first = currentWeekDays[0].dateObj;
    const last = currentWeekDays[6].dateObj;
    const fStr = first.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    const lStr = last.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    return `${fStr} - ${lStr}`;
  }, [currentWeekDays]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-20`}>
      
      {/* --- Toast Notification --- */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : toast.type === 'info'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-auto opacity-80 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- แถบควบคุมสำหรับผู้พัฒนา (Developer / Seller Mode Bar) --- */}
      <div className={`text-xs py-1.5 px-4 border-b transition-colors ${
        darkMode ? 'bg-indigo-950/80 border-indigo-900/60 text-indigo-200' : 'bg-indigo-900 text-indigo-100 border-indigo-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/40 font-semibold text-[11px]">
              โหมดทดสอบสำหรับผู้ขาย (Seller Preview)
            </span>
            <span className="hidden md:inline text-indigo-200/90">
              ข้อมูลเก็บในเครื่องลูกค้า 100% (ไม่มีค่าเซิร์ฟเวอร์) • ทดสอบระบบโควต้าฟรี 3 นิสัย และระบบใส่ License Key ได้ทันที
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span>สถานะปัจจุบัน: <strong className={isPro ? 'text-amber-300' : 'text-white'}>{isPro ? '👑 PRO VIP (ไม่จำกัด)' : `ผู้ใช้ฟรี (${habits.length}/${FREE_HABIT_LIMIT} นิสัย)`}</strong></span>
            <button
              onClick={handleToggleDevProMode}
              className="px-2.5 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>สลับสถานะ Free / Pro</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Top Navigation Bar --- */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-slate-900/85 border-slate-800' : 'bg-white/85 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent truncate">
                  HabitFlow
                </h1>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm">
                    <Crown className="w-3 h-3 fill-slate-950" /> PRO VIP
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    รุ่นฟรี ({habits.length}/{FREE_HABIT_LIMIT})
                  </span>
                )}
              </div>
              <p className={`text-xs hidden sm:block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {thaiDateHeader}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* ปุ่มสำรองข้อมูล (Backup / Restore) */}
            <button
              onClick={() => setIsBackupModalOpen(true)}
              title="สำรองและกู้คืนข้อมูล (Export / Import)"
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                darkMode 
                  ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200' 
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
              }`}
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span className="hidden lg:inline">สำรองข้อมูล</span>
            </button>

            {/* ปุ่มอัปเกรดเป็น PRO หรือแสดงสถานะ PRO */}
            {!isPro ? (
              <button
                onClick={() => {
                  setLicenseError('');
                  setIsUpgradeModalOpen(true);
                }}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform active:scale-95"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>อัปเกรด PRO</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                title="ดูข้อมูลสิทธิ์ PRO ของคุณ"
                className={`px-3 py-2 rounded-xl border text-xs font-semibold hidden md:flex items-center gap-1.5 transition ${
                  darkMode ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>เปิดใช้ PRO แล้ว</span>
              </button>
            )}

            {/* ปุ่มสลับโหมดมืด/สว่าง */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${
                darkMode 
                  ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' 
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="สลับโหมดมืด/สว่าง"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* ปุ่มเพิ่มนิสัยใหม่ */}
            <button
              onClick={handleOpenAddHabit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition transform active:scale-95"
            >
              {isQuotaReached ? <Lock className="w-4 h-4 text-amber-300" /> : <Plus className="w-4 h-4" />}
              <span>เพิ่มนิสัยใหม่</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* --- แถบแสดงโควต้าผู้ใช้ฟรี & โปรโมทการอัปเกรด (แสดงเฉพาะตอนเป็น Free Tier) --- */}
        {!isPro && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
            isQuotaReached
              ? darkMode 
                ? 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border-amber-700/60' 
                : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border-amber-200'
              : darkMode
                ? 'bg-slate-800/80 border-slate-700'
                : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isQuotaReached ? 'bg-amber-500 text-slate-950' : 'bg-indigo-500/10 text-indigo-500'
              }`}>
                {isQuotaReached ? <Lock className="w-5 h-5" /> : <Key className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold">
                    {isQuotaReached 
                      ? 'คุณใช้โควต้านิสัยรุ่นฟรีครบ 3/3 รายการแล้ว!' 
                      : `โควต้าการใช้งานรุ่นฟรี: สร้างไปแล้ว ${habits.length}/${FREE_HABIT_LIMIT} นิสัย`}
                  </h3>
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isQuotaReached ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, (habits.length / FREE_HABIT_LIMIT) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  ปลดล็อกเป็น <strong>HabitFlow PRO</strong> เพื่อสร้างนิสัยได้ไม่จำกัด และส่งออกรายงาน Excel (.csv) ได้ตลอดชีพโดยไม่ต้องเสียค่ารายเดือน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  setLicenseError('');
                  setIsUpgradeModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>ใส่รหัสปลดล็อก PRO / ดูแพ็กเกจ</span>
              </button>
            </div>
          </div>
        )}

        {/* --- แถบคำคมสร้างแรงบันดาลใจ --- */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          darkMode 
            ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-800/50' 
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-100'
        }`}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className={`text-sm font-medium italic ${darkMode ? 'text-indigo-200' : 'text-indigo-950'}`}>
              "{QUOTES[quoteIndex]}"
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setQuoteIndex((quoteIndex + 1) % QUOTES.length)}
              className={`text-xs px-2.5 py-1 rounded-lg transition ${
                darkMode ? 'hover:bg-indigo-900/50 text-indigo-300' : 'hover:bg-indigo-100/80 text-indigo-600'
              }`}
            >
              เปลี่ยนคำคม
            </button>
          </div>
        </div>

        {/* --- การ์ดสรุปสถิติ 4 ช่อง (Summary Cards) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* การ์ด 1: เป้าหมายวันนี้ */}
          <div className={`p-5 rounded-2xl border shadow-sm transition ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  เช็คอินวันนี้
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-extrabold">{todayStats.completed}/{todayStats.total}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    todayStats.percentage === 100 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {todayStats.percentage}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${todayStats.percentage}%` }}
              />
            </div>
          </div>

          {/* การ์ด 2: สถิติทำต่อเนื่องสูงสุด */}
          <div className={`p-5 rounded-2xl border shadow-sm transition ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ทำต่อเนื่องสูงสุด (Streak)
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-extrabold text-amber-500">{bestStreak}</h3>
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>วันติดต่อกัน</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-6 h-6" />
              </div>
            </div>
            <p className={`mt-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              รักษาความสม่ำเสมอทุกวันเพื่อเพิ่มสถิติไฟลุก! 🔥
            </p>
          </div>

          {/* การ์ด 3: ความสำเร็จรายสัปดาห์ */}
          <div className={`p-5 rounded-2xl border shadow-sm transition ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  เป้าหมายสัปดาห์นี้
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-extrabold text-indigo-500">{weeklyOverallRate}%</h3>
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>ของเป้าหมายที่ตั้งไว้</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyOverallRate}%` }}
              />
            </div>
          </div>

          {/* การ์ด 4: นิสัยทั้งหมด & สถานะโควต้า */}
          <div className={`p-5 rounded-2xl border shadow-sm transition ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  โควต้านิสัยของคุณ
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-extrabold text-purple-500">
                    {habits.length}{!isPro && <span className="text-lg text-slate-400">/{FREE_HABIT_LIMIT}</span>}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isPro ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {isPro ? 'ไม่จำกัด (PRO)' : 'Free Tier'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                บันทึกในเครื่องปลอดภัย 100%
              </span>
              <button 
                onClick={() => setIsBackupModalOpen(true)}
                className="text-indigo-500 hover:underline font-semibold"
              >
                สำรองไฟล์ →
              </button>
            </div>
          </div>
        </div>

        {/* --- โซนเช็คอินด่วนสำหรับวันนี้ (Today's Quick Focus) --- */}
        {weekOffset === 0 && habits.length > 0 && (
          <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold">เช็คอินด่วนสำหรับวันนี้</h2>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                todayStats.completed === todayStats.total 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {todayStats.completed === todayStats.total ? '🎉 ทำครบทุกเป้าหมายวันนี้แล้ว!' : `เหลืออีก ${todayStats.total - todayStats.completed} รายการ`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {habits.map(habit => {
                const isDoneToday = !!habit.completedDates?.[todayStr];
                const streak = calculateStreak(habit.completedDates);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitDate(habit.id, todayStr)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isDoneToday
                        ? darkMode 
                          ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                        : darkMode
                          ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                          : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-2xl shrink-0">{habit.icon}</span>
                      <div className="truncate">
                        <p className={`text-sm font-semibold truncate ${isDoneToday ? 'line-through opacity-80' : ''}`}>
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mt-0.5">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{streak} วันติด</span>
                        </div>
                      </div>
                    </div>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-active:scale-90 ${
                      isDoneToday 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                        : darkMode ? 'border-2 border-slate-600 text-transparent' : 'border-2 border-slate-300 text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>
                );
              })}

              {/* การ์ดปุ่มลัดเพิ่มนิสัย หรือปลดล็อก PRO */}
              <button
                onClick={handleOpenAddHabit}
                className={`p-3.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                  isQuotaReached
                    ? darkMode
                      ? 'border-amber-600/50 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40'
                      : 'border-amber-300 bg-amber-50/60 text-amber-700 hover:bg-amber-50'
                    : darkMode
                      ? 'border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400'
                      : 'border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600'
                }`}
              >
                {isQuotaReached ? (
                  <>
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>ปลดล็อกนิสัยที่ 4+ (PRO)</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มเป้าหมายใหม่ ({habits.length}/{isPro ? '∞' : FREE_HABIT_LIMIT})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- ตัวกรองหมวดหมู่ & ตัวเลือกสัปดาห์ --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* หมวดหมู่ */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : darkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.id !== 'all' && <span className={`w-2 h-2 rounded-full ${cat.color}`} />}
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* ตัวควบคุมการเลื่อนสัปดาห์ */}
          <div className={`flex items-center self-start sm:self-auto gap-2 px-3 py-1.5 rounded-xl border ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="สัปดาห์ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-semibold px-2 min-w-[130px] text-center">
              {weekOffset === 0 ? 'สัปดาห์นี้' : `ย้อนหลัง ${Math.abs(weekOffset)} สัปดาห์`}
              <span className={`block text-[10px] font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ({weekRangeLabel})
              </span>
            </div>
            <button
              onClick={() => setWeekOffset(prev => Math.min(0, prev + 1))}
              disabled={weekOffset === 0}
              className={`p-1 rounded-lg transition ${
                weekOffset === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="สัปดาห์ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[11px] text-indigo-500 hover:underline font-medium pl-1 border-l border-slate-300 dark:border-slate-700"
              >
                กลับมาวันนี้
              </button>
            )}
          </div>
        </div>

        {/* --- ตารางเช็คอินรายสัปดาห์ (Weekly Habit Grid) --- */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>ตารางบันทึกนิสัยรายสัปดาห์</span>
              </h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                คลิกที่ช่องวันเพื่อบันทึกหรือยกเลิกการทำนิสัยในแต่ละวัน ข้อมูลจะถูกบันทึกอัตโนมัติ
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                onClick={handleExportCSV}
                className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isPro
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    : darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>ส่งออก Excel (.csv)</span>
                {!isPro && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </button>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  darkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเซ็ตค่าเริ่มต้น</span>
              </button>
            </div>
          </div>

          {habitPerformanceData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold">ยังไม่มีรายการนิสัยในหมวดหมู่นี้</h3>
              <p className={`text-xs mt-1 mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                เริ่มต้นสร้างนิสัยดีๆ เพื่อติดตามความก้าวหน้าของคุณได้ทันที
              </p>
              <button
                onClick={handleOpenAddHabit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                เพิ่มนิสัยแรกของคุณ
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className={`border-b text-xs font-semibold ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50/80 border-slate-200 text-slate-600'}`}>
                    <th className="py-3.5 px-5 w-64">รายการนิสัย</th>
                    {currentWeekDays.map(day => (
                      <th key={day.dateStr} className="py-3 px-2 text-center w-14">
                        <div className={`inline-flex flex-col items-center justify-center w-11 py-1 rounded-xl ${
                          day.isToday 
                            ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/30' 
                            : ''
                        }`}>
                          <span className="text-[11px]">{day.shortName}</span>
                          <span className="text-sm">{day.dayNumber}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-center w-28">เป้าหมายสัปดาห์</th>
                    <th className="py-3.5 px-4 text-center w-24">ต่อเนื่อง</th>
                    <th className="py-3.5 px-4 text-right w-14">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/70 text-sm">
                  {habitPerformanceData.map(habit => (
                    <tr 
                      key={habit.id} 
                      className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}
                    >
                      {/* ชื่อนิสัยและหมวดหมู่ */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-700/70 shrink-0">
                            {habit.icon}
                          </span>
                          <div>
                            <p className="font-semibold leading-snug">{habit.name}</p>
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${habit.catInfo.light} ${habit.catInfo.text} dark:bg-opacity-20`}>
                              {habit.catInfo.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ปุ่มเช็คอิน 7 วัน */}
                      {currentWeekDays.map(day => {
                        const isChecked = !!habit.completedDates?.[day.dateStr];
                        return (
                          <td key={day.dateStr} className="py-3 px-2 text-center">
                            <button
                              onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                              disabled={day.isFuture}
                              title={`${habit.name} - ${day.fullName}ที่ ${day.dayNumber}`}
                              className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                day.isFuture
                                  ? 'opacity-25 cursor-not-allowed border border-dashed border-slate-400 dark:border-slate-600'
                                  : isChecked
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-100 hover:bg-emerald-600'
                                    : darkMode
                                      ? 'bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-transparent'
                                      : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-transparent'
                              }`}
                            >
                              <Check className={`w-5 h-5 stroke-[2.5] transition-transform ${isChecked ? 'scale-100' : 'scale-50 opacity-0'}`} />
                            </button>
                          </td>
                        );
                      })}

                      {/* ความคืบหน้าเทียบเป้าหมายรายสัปดาห์ */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-baseline gap-1 text-xs font-bold mb-1">
                            <span className={habit.weekCompleted >= habit.targetDaysPerWeek ? 'text-emerald-500' : ''}>
                              {habit.weekCompleted}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-400">{habit.targetDaysPerWeek} วัน</span>
                          </div>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                habit.weekCompleted >= habit.targetDaysPerWeek ? 'bg-emerald-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${habit.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* จำนวนวันต่อเนื่อง (Streak) */}
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          habit.streak > 0 
                            ? 'bg-amber-500/15 text-amber-500' 
                            : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'fill-amber-500' : ''}`} />
                          <span>{habit.streak}</span>
                        </div>
                      </td>

                      {/* ปุ่มลบ */}
                      <td className="py-4 px-4 text-right">
                        {deleteConfirmId === habit.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded hover:bg-rose-600"
                            >
                              ยืนยัน
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(habit.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            title="ลบนิสัยนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- โซนแผนภูมิและกราฟวิเคราะห์ (Weekly Streak & Analytics Charts) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* กราฟที่ 1: จำนวนนิสัยที่ทำสำเร็จในแต่ละวันของสัปดาห์ (Bar Chart) */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <span>แผนภูมิความสำเร็จรายวัน (สัปดาห์นี้)</span>
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  เปรียบเทียบจำนวนนิสัยที่เช็คอินสำเร็จในแต่ละวัน (จันทร์ - อาทิตย์)
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip
                    cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`p-3 rounded-xl border shadow-lg text-xs ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                            <p className="font-bold mb-1">{data.fullName}</p>
                            <p className="text-emerald-500 font-semibold">
                              ทำสำเร็จ: {data.completed} / {data.total} รายการ
                            </p>
                            <p className="text-indigo-400">คิดเป็น: {data.rate}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {weeklyChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? '#6366f1' : '#10b981'} 
                        fillOpacity={entry.isToday ? 1 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>💡 แท่งสีม่วงน้ำเงินคือวันปัจจุบัน</span>
              <span>เป้าหมายสูงสุด: {filteredHabits.length} นิสัย/วัน</span>
            </div>
          </div>

          {/* กราฟที่ 2: แนวโน้มความสม่ำเสมอ & อันดับ Streak สูงสุด (Area Chart & Leaderboard) */}
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200/80'}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>กราฟอัตราความสม่ำเสมอ & อันดับ Streak</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    เปอร์เซ็นต์ความสำเร็จรายวันและนิสัยที่ทำต่อเนื่องนานที่สุด
                  </p>
                </div>
              </div>

              {/* กราฟเส้นโค้ง Area แสดง % ความสม่ำเสมอ */}
              <div className="h-36 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-2.5 rounded-xl border shadow-lg text-xs ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                              <p className="font-bold">{data.fullName}</p>
                              <p className="text-purple-500 font-semibold">ความสม่ำเสมอ: {data.rate}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* อันดับนิสัยที่ทำต่อเนื่องสูงสุด 3 อันดับแรก */}
              <div className="space-y-2.5 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  🏆 อันดับการทำต่อเนื่องสูงสุด (Top Streaks)
                </p>
                {[...habitPerformanceData]
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((h, idx) => (
                    <div 
                      key={h.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-lg">{h.icon}</span>
                        <span className="text-xs font-semibold truncate">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                        <Flame className="w-4 h-4 fill-amber-500" />
                        <span>{h.streak} วันติด</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* =====================================================================
          MODAL 1: หน้าต่าง Pricing & License Key Activation (สำหรับเปิดขายจริง)
         ===================================================================== */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Header พรีเมียม */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold mb-3 shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>HABITFLOW PRO EDITION</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold">
                ปลดล็อกศักยภาพการสร้างวินัยแบบไร้ขีดจำกัด
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1.5 max-w-xl">
                จ่ายครั้งเดียวจบ ไม่มีค่ารายเดือนแอบแฝง ข้อมูลทั้งหมดเก็บในเครื่องของคุณอย่างปลอดภัย 100% พร้อมระบบสำรองไฟล์ตลอดชีพ
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* ตารางเปรียบเทียบสิทธิ์ & แพ็กเกจราคา */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* แพ็กเกจรายปี */}
                <div 
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                    selectedPlan === 'yearly'
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">แพ็กเกจรายปี (Annual)</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-400'}`}>
                      {selectedPlan === 'yearly' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold">฿99</span>
                    <span className="text-xs text-slate-400">/ ปี (ตกเดือนละ 8 บาท)</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> สร้างนิสัยได้ไม่จำกัดรายการ</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> ส่งออกรายงาน Excel (.csv)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> สำรองและย้ายเครื่องด้วยไฟล์ .json</li>
                  </ul>
                </div>

                {/* แพ็กเกจตลอดชีพ (ขายดีที่สุด) */}
                <div 
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                    selectedPlan === 'lifetime'
                      ? 'border-amber-500 bg-amber-500/10'
                      : darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow-xs">
                    คุ้มที่สุด • จ่ายครั้งเดียวจบ
                  </span>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">ตลอดชีพ (Lifetime Deal)</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'lifetime' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-400'}`}>
                      {selectedPlan === 'lifetime' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold">฿199</span>
                    <span className="text-xs line-through text-slate-400">฿590</span>
                    <span className="text-xs text-emerald-500 font-semibold">ใช้ได้ตลอดชีพ</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>ปลดล็อกทุกฟีเจอร์ตลอดชีพ</strong></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> รับรหัส License Key ส่วนตัวทันที</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> อัปเดตฟีเจอร์ใหม่ฟรีในอนาคต</li>
                  </ul>
                </div>
              </div>

              {/* ปุ่มจำลองการสั่งซื้อเพื่อรับรหัส */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs">
                  <p className="font-bold">ช่องทางชำระเงินอัตโนมัติ (สำหรับเชื่อมต่อ Stripe / Gumroad / LINE OA)</p>
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    เมื่อลูกค้าชำระเงินเสร็จ ระบบจะส่งรหัส License Key ให้ทางอีเมลหรือแชทอัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInputLicenseKey('HABIT-PRO-2026');
                    showToast('จำลองการสั่งซื้อสำเร็จ! ระบบกรอกรหัส License Key ให้คุณด้านล่างแล้ว กดปุ่มเปิดใช้งานได้เลย');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <span>ทดลองสั่งซื้อ ({selectedPlan === 'lifetime' ? '฿199' : '฿99'})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ฟอร์มกรอกรหัส License Key */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleActivateLicense} className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    มีรหัสปลดล็อก (License Key) แล้วใช่ไหม? กรอกที่นี่เพื่อเปิดใช้งานทันที:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="เช่น HABIT-PRO-2026 หรือ PRO-VIP-999"
                        value={inputLicenseKey}
                        onChange={(e) => {
                          setInputLicenseKey(e.target.value);
                          setLicenseError('');
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                    >
                      ปลดล็อก PRO ทันที
                    </button>
                  </div>

                  {licenseError && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{licenseError}</span>
                    </p>
                  )}

                  {/* ปุ่มคลิกเดียวกรอกรหัสตัวอย่างสำหรับทดสอบ */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>รหัสทดสอบ (คลิกเพื่อกรอกอัตโนมัติ):</span>
                    {VALID_DEMO_KEYS.map(k => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => {
                          setInputLicenseKey(k);
                          setLicenseError('');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                          inputLicenseKey === k
                            ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                            : darkMode ? 'border-slate-700 bg-slate-900 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Copy className="w-3 h-3 opacity-70" />
                        {k}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ศูนย์สำรองและกู้คืนข้อมูล (Data Backup & Restore Modal)
         ===================================================================== */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">ศูนย์สำรองและกู้คืนข้อมูล (Local Backup)</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    ย้ายเครื่องหรือเก็บสำรองข้อมูลไว้ในคอมพิวเตอร์/มือถือของคุณเองได้ตลอดเวลา
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBackupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 1. Export JSON */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <FileJson className="w-8 h-8 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">สำรองข้อมูลทั้งหมด (.JSON)</h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ดาวน์โหลดข้อมูลนิสัย ประวัติการเช็คอิน และสถานะ PRO ทั้งหมดเก็บไว้เป็นไฟล์เพื่อนำกลับมาใช้ใหม่หรือย้ายอุปกรณ์
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด .JSON</span>
                </button>
              </div>

              {/* 2. Import JSON */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Upload className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">กู้คืนข้อมูลจากไฟล์สำรอง (Import .JSON)</h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      อัปโหลดไฟล์ `.json` ที่คุณเคยสำรองไว้ เพื่อนำข้อมูลนิสัยและสถิติทั้งหมดกลับเข้าสู่ระบบทันที
                    </p>
                  </div>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      darkMode ? 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>เลือกไฟล์ .JSON</span>
                  </button>
                </div>
              </div>

              {/* 3. Export CSV สำหรับ Excel (PRO Feature) */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold">ส่งออกรายงานตารางสถิติ (.CSV)</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-amber-500" /> PRO
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      สร้างไฟล์ตารางสรุปสถิติภาษาไทยสำหรับนำไปเปิดวิเคราะห์ต่อใน Microsoft Excel หรือ Google Sheets
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>ส่งออก .CSV</span>
                </button>
              </div>
            </div>

            <div className={`px-5 py-3 border-t text-xs flex items-center justify-between ${
              darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <span>🔒 ข้อมูลถูกจัดเก็บใน LocalStorage บนเครื่องของคุณ</span>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="font-semibold text-indigo-500 hover:underline"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: เพิ่มนิสัยใหม่
         ===================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>สร้างเป้าหมายนิสัยใหม่</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHabit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  ชื่อนิสัย / เป้าหมายรายวัน *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ดื่มน้ำ 2 ลิตร, อ่านหนังสือ 1 บท, งดน้ำหวาน"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  เลือกไอคอนสัญลักษณ์
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewHabitIcon(emoji)}
                      className={`h-10 rounded-xl text-xl flex items-center justify-center border transition ${
                        newHabitIcon === emoji
                          ? 'border-indigo-500 bg-indigo-500/15 scale-105 shadow-2xs'
                          : darkMode ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  หมวดหมู่
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewHabitCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                        newHabitCategory === cat.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                          : darkMode ? 'border-slate-700 bg-slate-900/40 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="uppercase tracking-wider">ความถี่เป้าหมายต่อสัปดาห์</span>
                  <span className="text-indigo-500 font-bold">{newHabitTarget} วัน / สัปดาห์</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 วัน</span>
                  <span>3 วัน</span>
                  <span>5 วัน</span>
                  <span>ทุกวัน (7 วัน)</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                    darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  บันทึกนิสัย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: ยืนยันการรีเซ็ตข้อมูลตัวอย่าง
         ===================================================================== */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-xl ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">รีเซ็ตเป็นข้อมูลตัวอย่าง?</h3>
            </div>
            <p className={`text-xs leading-relaxed mb-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              การดำเนินการนี้จะคืนค่าข้อมูลนิสัยกลับเป็น 3 รายการเริ่มต้น เพื่อใช้ทดสอบระบบโควต้าผู้ใช้ฟรี
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${
                  darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResetDemoData}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                ยืนยันรีเซ็ตข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}