"use client";

import { useState, useEffect } from "react";
import { Play, X, ChevronRight, ChevronLeft, Timer, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ClientCookingMode({ instructions }: { instructions: string[] }) {
  const dict = useDictionary();
  const t = dict.cooking;
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Extract time from step text (e.g., "10 minutes", "5 min")
  useEffect(() => {
    setIsTimerRunning(false);
    const stepText = instructions[currentStep] || "";
    const timeMatch = stepText.match(/(\d+)\s*(minute|min|m)\b/i);
    if (timeMatch) {
      setTimerSeconds(parseInt(timeMatch[1]) * 60);
    } else {
      setTimerSeconds(0);
    }
  }, [currentStep, instructions]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert(t.timer_finished || "Timer finished!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, t.timer_finished]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const nextStep = () => {
    if (currentStep < instructions.length - 1) setCurrentStep(c => c + 1);
  };
  
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stepProgressText = (t.step_progress || "Step {current} of {total}")
    .replace("{current}", (currentStep + 1).toString())
    .replace("{total}", instructions.length.toString());

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--primary)] text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-8"
      >
        <Play size={24} fill="currentColor" />
        {t.start_cooking}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-slate-900 text-white z-[110] flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-slate-800">
              <span className="font-bold text-slate-400">{stepProgressText}</span>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto w-full relative">
              <motion.p 
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl md:text-5xl font-bold leading-tight md:leading-tight"
              >
                {instructions[currentStep]}
              </motion.p>

              {/* Timer UI */}
              {timerSeconds > 0 && (
                <div className="mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-3xl p-6 flex flex-col items-center min-w-[250px]">
                  <Timer className="text-emerald-400 mb-2" size={32} />
                  <div className="text-5xl font-mono font-bold mb-4 tracking-wider">
                    {formatTime(timerSeconds)}
                  </div>
                  <button 
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full font-bold text-lg transition-colors ${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                  >
                    {isTimerRunning ? t.pause : t.start_timer}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 pb-12 flex justify-between gap-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 bg-slate-800 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft /> {t.previous}
              </button>
              
              {currentStep === instructions.length - 1 ? (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-emerald-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  {t.finish} <CheckCircle2 />
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-[var(--primary)] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-rose-500/20"
                >
                  {t.next} <ChevronRight />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
