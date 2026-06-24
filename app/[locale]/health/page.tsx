"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, Apple, Scale, BookOpen, BrainCircuit, HeartPulse, 
  ChevronLeft, ChevronDown, Plus, Minus, Wand2, ArrowRight, TrendingUp, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState("calories");
  
  // Health Data
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [calorieLogs, setCalorieLogs] = useState<any[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentWeight, setCurrentWeight] = useState(0);
  
  // Forms
  const [newWeight, setNewWeight] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("Lunch");
  const [isMealTypeDropdownOpen, setIsMealTypeDropdownOpen] = useState(false);
  
  // AI Report
  const [aiReport, setAiReport] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);

  const [analyzingFood, setAnalyzingFood] = useState(false);

  useEffect(() => {
    fetchWeight();
    fetchCalories();
  }, []);

  const fetchWeight = async () => {
    const res = await fetch("/api/health/weight");
    if (res.ok) {
      const data = await res.json();
      setWeightLogs(data.logs);
      if (data.profile?.currentWeight) setCurrentWeight(data.profile.currentWeight);
    }
  };

  const fetchCalories = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/health/calories?date=${dateStr}`);
    if (res.ok) {
      const data = await res.json();
      setCalorieLogs(data.logs);
      if (data.goal) setDailyGoal(data.goal);
    }
  };

  const addWeightLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    await fetch("/api/health/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: parseFloat(newWeight), date: new Date().toISOString() })
    });
    setNewWeight("");
    fetchWeight();
  };

  const addCalorieLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;
    
    await fetch("/api/health/calories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodName, calories: parseInt(calories), mealType, date: new Date().toISOString() })
    });
    setFoodName("");
    setCalories("");
    setCustomizing(false);
    fetchCalories();
  };

  const handleAutoCalories = async () => {
    if (!foodName) {
      alert("Please enter a food name first");
      return;
    }
    setAnalyzingFood(true);
    try {
      const res = await fetch("/api/health/auto-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.calories) {
          setCalories(data.calories.toString());
        }
      } else {
        alert("Failed to fetch auto value.");
      }
    } catch (error) {
      console.error(error);
    }
    setAnalyzingFood(false);
  };

  const generateReport = async () => {
    setLoadingReport(true);
    const res = await fetch("/api/health/report");
    if (res.ok) {
      const data = await res.json();
      setAiReport(data.report);
    }
    setLoadingReport(false);
  };

  const totalCaloriesToday = calorieLogs.reduce((sum, log) => sum + log.calories, 0);
  const progressPercent = Math.min(100, (totalCaloriesToday / dailyGoal) * 100);

  const tabs = [
    { id: "calories", label: "Calories" },
    { id: "weight", label: "Weight" },
    { id: "dietitian", label: "Dietitian" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-32 font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="pt-14 pb-6 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                  <ChevronLeft size={20} />
                </div>
              </Link>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                My Health
              </h1>
            </div>
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
              <HeartPulse size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Track your nutrition, weight, and get AI insights.</p>
        </div>
      </header>

      {/* Segmented Control Tabs */}
      <div className="px-6 mt-6 max-w-xl mx-auto">
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl relative shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-3 text-sm font-bold capitalize transition-colors z-10 ${
                  isActive ? "text-rose-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="health-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 mt-6">
        <AnimatePresence mode="wait">
          {activeTab === "calories" && (
            <motion.div 
              key="calories"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Daily Progress Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
                
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700">
                  <Apple size={22} className="text-[var(--primary)]"/> Today's Intake
                </h2>
                
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-5xl font-black text-slate-800 tracking-tight">{totalCaloriesToday}</span>
                    <span className="text-slate-400 font-bold ml-2">/ {dailyGoal} kcal</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-[var(--primary)]">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
                
                <div className="h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-[var(--primary)] rounded-full transition-all duration-1000 relative" 
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>

              {/* Log Food Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-700 text-lg">Log Food</h3>
                  <div className="relative z-20">
                    <div 
                      onClick={() => setIsMealTypeDropdownOpen(!isMealTypeDropdownOpen)}
                      className="bg-slate-50 text-sm border border-slate-100 rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer font-bold text-[var(--primary)] hover:bg-slate-100 transition-colors shadow-sm select-none"
                    >
                      <span>{mealType}</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isMealTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isMealTypeDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-[calc(100%+8px)] bg-white border border-slate-100 rounded-2xl shadow-xl py-2 min-w-[120px] z-30"
                        >
                          {["Breakfast", "Lunch", "Dinner", "Snack"].map(type => (
                            <div 
                              key={type} 
                              onClick={() => { setMealType(type); setIsMealTypeDropdownOpen(false); }}
                              className={`px-4 py-2.5 cursor-pointer hover:bg-slate-50 font-bold text-sm transition-colors ${mealType === type ? 'text-[var(--primary)] bg-[var(--primary)]/5' : 'text-slate-600'}`}
                            >
                              {type}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <form onSubmit={addCalorieLog} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Food Name (e.g. Avocado Toast)" 
                    value={foodName} 
                    onChange={e => setFoodName(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-transparent transition-all font-medium text-slate-700 placeholder:text-slate-400" 
                    required 
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="Calories" 
                      value={calories} 
                      onChange={e => setCalories(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-transparent transition-all font-bold text-slate-700 placeholder:text-slate-400" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={handleAutoCalories} 
                      disabled={analyzingFood}
                      className="w-full bg-rose-50 text-rose-500 rounded-2xl px-5 py-4 font-bold shadow-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {analyzingFood ? <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div> : <Wand2 size={18} />}
                      Auto Value
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-[var(--primary)] text-white rounded-2xl py-4 font-black shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary)]/90 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> Add to Log
                  </button>
                </form>
              </div>

              {/* History List */}
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-slate-700 text-lg px-2">Today's Log</h3>
                <div className="space-y-3">
                  {calorieLogs.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-8 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center">
                      <Apple size={32} className="text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No food logged today.</p>
                    </div>
                  ) : (
                    calorieLogs.map(log => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={log.id} 
                        className="bg-white rounded-2xl p-5 flex justify-between items-center shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="font-bold text-slate-700 capitalize text-[15px]">{log.foodName}</p>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md w-fit">{log.mealType}</span>
                        </div>
                        <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1.5 rounded-xl font-black text-sm">
                          +{log.calories}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "weight" && (
            <motion.div 
              key="weight"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
               {/* Current Weight Widget */}
               <div className="bg-gradient-to-br from-[var(--primary)] to-rose-400 rounded-[2rem] p-8 shadow-lg text-center relative overflow-hidden text-white">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                 <Scale size={40} className="mx-auto text-white/80 mb-4" />
                 <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Current Weight</h2>
                 <p className="text-6xl font-black">{currentWeight || "--"}<span className="text-2xl text-white/60 ml-2">kg</span></p>
               </div>

               {/* Add Weight Form */}
               <form onSubmit={addWeightLog} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                 <input 
                   type="number" 
                   step="0.1" 
                   placeholder="Enter today's weight (kg)" 
                   value={newWeight} 
                   onChange={e => setNewWeight(e.target.value)} 
                   className="flex-1 bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none border-none px-4 py-3 sm:py-2 outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                   required 
                 />
                 <button type="submit" className="bg-[var(--primary)] text-white rounded-xl px-6 py-3 font-bold shadow-md hover:bg-[var(--primary)]/90 transition-all flex justify-center items-center gap-2">
                   Save <ArrowRight size={18} />
                 </button>
               </form>

               {/* Weight History */}
               <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                 <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                   <TrendingUp size={20} className="text-[var(--primary)]" /> Weight History
                 </h3>
                 <div className="space-y-4">
                   {weightLogs.length === 0 ? (
                     <p className="text-slate-400 text-center text-sm font-medium">No weight data available.</p>
                   ) : (
                     weightLogs.slice().reverse().map((log, i) => (
                       <div key={log.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
                         <div className="flex flex-col gap-1">
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">
                             {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="font-black text-slate-700 text-lg group-hover:text-[var(--primary)] transition-colors">{log.weight} kg</span>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === "dietitian" && (
            <motion.div 
              key="dietitian"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <BrainCircuit size={40} className="text-violet-300" />
                  </div>
                  <h2 className="text-3xl font-black mb-3">AI Dietitian</h2>
                  <p className="text-slate-300 font-medium mb-8 leading-relaxed">
                    Get a personalized analysis of your diet and weight trends over the last 30 days.
                  </p>
                  <button 
                    onClick={generateReport} 
                    disabled={loadingReport}
                    className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {loadingReport ? (
                      <>
                        <Loader2 size={22} className="animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={22} className="text-violet-500" /> Generate Monthly Report
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {aiReport && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                  >
                    <div className="prose prose-slate prose-headings:font-black prose-p:font-medium prose-strong:text-violet-600 max-w-none text-[15px] leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
