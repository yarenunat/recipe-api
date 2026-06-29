"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Refrigerator,
  HeartPulse,
  Bookmark,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/",        icon: HomeIcon,      label: "Home"    },
  { href: "/pantry",  icon: Refrigerator,  label: "Pantry"  },
  { href: "/health",  icon: HeartPulse,    label: "Health"  },
  { href: "/plan",    icon: Calendar,      label: "Plan"    },
  { href: "/saved",   icon: Bookmark,      label: "Saved"   },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  // Resolve active locale from path
  const segments = pathname.split('/');
  const currentLocale = ['tr', 'en', 'zh', 'hi', 'es'].includes(segments[1]) ? segments[1] : '';

  const getLocalizedHref = (href: string) => {
    if (!currentLocale) return href;
    if (href === "/") return `/${currentLocale}`;
    return `/${currentLocale}${href}`;
  };

  const isActive = (href: string) => {
    const localizedHref = getLocalizedHref(href);
    if (href === "/") {
      return pathname === `/${currentLocale}` || pathname === "/";
    }
    return pathname.startsWith(localizedHref);
  };

  return (
    <nav
      style={{ fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100]
                 w-[92vw] max-w-sm
                 h-[64px]
                 bg-white/90 backdrop-blur-xl
                 rounded-[32px]
                 shadow-[0_8px_32px_rgba(0,0,0,0.10),0_1px_0_rgba(255,255,255,0.9)_inset]
                 border border-white/60
                 flex items-center justify-around px-2"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={getLocalizedHref(href)} className="relative flex flex-col items-center justify-center w-10 h-10 group">
            {/* Pill indicator */}
            <AnimatePresence>
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl bg-[var(--primary)]/15"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
              animate={{
                y: 0,
                scale: active ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative z-10"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={`transition-colors duration-200 ${
                  active ? "text-[var(--primary)]" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
