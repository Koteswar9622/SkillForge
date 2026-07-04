import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldAlert, Cpu, Award, MessageSquare, BookOpen, BrainCircuit, Terminal, LogOut, ChevronLeft, ChevronRight, LayoutDashboard, Database, HelpCircle, Laptop, X, Trash2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onResetAccount?: () => void;
}

export default function Sidebar({ activeTab, onSelectTab, userEmail, onLogout, isOpen, onClose, onResetAccount }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview Portal', icon: LayoutDashboard, color: 'hover:text-indigo-400' },
    { id: 'profile', name: 'Profile & Gaps', icon: Compass, color: 'hover:text-indigo-400' },
    { id: 'roadmap', name: 'Learning Roadmap', icon: BrainCircuit, color: 'hover:text-indigo-400' },
    { id: 'tutor', name: 'AI Tutor & RAG', icon: MessageSquare, color: 'hover:text-indigo-400' },
    { id: 'practice', name: 'Practice Center', icon: HelpCircle, color: 'hover:text-indigo-400' },
    { id: 'projects', name: 'Portfolio Lab', icon: Laptop, color: 'hover:text-indigo-400' },
    { id: 'interviews', name: 'Mock Interview', icon: Terminal, color: 'hover:text-indigo-400' },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay Backing */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 cursor-pointer"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 glass-panel border-r border-slate-900 flex flex-col justify-between h-screen flex-shrink-0 z-50 md:z-20`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="px-6 py-5.5 border-b border-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shadow shadow-indigo-500/10">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Skill<span className="text-indigo-400">Forge</span>
              </span>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1.5'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="h-1.5 w-1.5 rounded-full bg-white shadow-md shadow-white/50"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Information Profile footer */}
      <div className="p-4 border-t border-slate-900/60 flex flex-col gap-3">
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/35 border border-slate-900/80 text-left">
          <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Logged in Student</p>
          <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">{userEmail}</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 cursor-pointer transition-all animate-pulse"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Exit Platform</span>
        </button>

        {onResetAccount && (
          <button
            onClick={onResetAccount}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 cursor-pointer transition-all"
          >
            <Trash2 className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-rose-400" />
            <span>Reset Account & data</span>
          </button>
        )}
      </div>
    </div>
    </>
  );
}
