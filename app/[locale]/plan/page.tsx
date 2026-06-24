"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, ChefHat, Bookmark, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MealPlannerPage() {
 const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="px-6 pt-12 pb-6 flex items-center justify-between z-50">
          <h1 className="text-2xl font-bold tracking-tight text-slate-700">Meal Plan</h1>
          <Button size="sm" className="rounded-full h-10 px-5 shadow-sm">
            <Plus size={16} className="mr-2" />
            Auto-fill
          </Button>
        </header>

        <main className="px-6 space-y-6 mt-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-600">
              <CalendarIcon size={20} className="text-[var(--primary)]" />
              This Week
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-100 bg-white shadow-sm text-slate-500 hover:text-[var(--primary)]">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-slate-100 bg-white shadow-sm text-slate-500 hover:text-[var(--primary)]">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>

          {/* Days Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {days.map((day, i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow rounded-3xl">
                  <CardContent className="p-0 flex h-full">
                    <div className="w-20 flex flex-col items-center justify-center py-6 bg-[var(--accent)] border-r border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-400 mb-1">{day}</span>
                      <span className="text-2xl font-bold text-[var(--primary)]">{12 + i}</span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      {i === 0 || i === 3 ? (
                        <div className="space-y-3">
                          <div className="text-base font-semibold text-slate-600 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                            Oatmeal with Berries
                          </div>
                          <div className="text-base font-semibold text-slate-600 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            Grilled Salmon
                          </div>
                        </div>
                      ) : (
                        <button className="text-sm text-slate-400 font-semibold flex items-center gap-2 hover:text-[var(--primary)] transition-colors w-full h-full justify-start">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300">
                            <Plus size={16} />
                          </div>
                          Add Meal
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Floating Bottom Nav - Matches Homepage */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-[4.5rem] bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between px-3 z-40">
        <Link href="/" className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <ChefHat size={22} />
          </button>
        </Link>
        <div className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <Search size={22} />
          </button>
        </div>
        <div className="w-16 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-sm mx-2">
          <CalendarIcon size={22} />
        </div>
        <Link href="/saved" className="flex-1 flex justify-center">
          <button className="text-slate-300 hover:text-[var(--primary)] transition-colors p-2">
            <Bookmark size={22} />
          </button>
        </Link>
      </nav>
    </div>
  );
}
