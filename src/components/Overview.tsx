import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Award, Trophy, GraduationCap, CheckCircle2, ChevronRight, RefreshCw, Cpu, BrainCircuit, MessageSquare, Terminal, HelpCircle, Laptop } from 'lucide-react';
import { Progress, Profile } from '../types';

interface OverviewProps {
  token: string;
  profile: Profile | null;
  onNavigateToTab: (tab: string) => void;
  progressTrigger: number;
}

export default function Overview({ token, profile, onNavigateToTab, progressTrigger }: OverviewProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token, progressTrigger]);

  const cards = [
    {
      title: 'Average Quiz Score',
      value: progress ? `${progress.averageQuizScore}%` : '0%',
      desc: 'Overall multiple-choice score',
      icon: Trophy,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      title: 'Projects Graded',
      value: progress ? progress.projectsCompleted.toString() : '0',
      desc: 'Completed coding exercises',
      icon: Laptop,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Interviews Completed',
      value: progress ? progress.interviewsCompleted.toString() : '0',
      desc: 'Interactive mock attempts',
      icon: Terminal,
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      title: 'Completed Milestones',
      value: progress ? progress.completedNodes?.length.toString() : '0',
      desc: 'Uncovered curriculum nodes',
      icon: Award,
      color: 'text-indigo-400 bg-indigo-500/10'
    }
  ];

  // Helper checklist item tracker
  const getChecklistItems = () => [
    {
      title: 'Configure student goals & target career',
      desc: 'Instruct ProfileAgent to construct background metrics.',
      done: !!profile,
      tab: 'profile'
    },
    {
      title: 'Evaluate Skill Gaps diagnostic',
      desc: 'Trigger SkillGapAgent assessment evaluation.',
      done: progress ? progress.completedNodes?.length > 0 || progress.totalQuizzesTaken > 0 : false,
      tab: 'profile'
    },
    {
      title: 'Engage with AI Tutor Chat',
      desc: 'Review concepts or upload PDF slides into Vector RAG.',
      done: true, // always available
      tab: 'tutor'
    },
    {
      title: 'Grade active Practice Quiz',
      desc: 'Complete Multiple-Choice milestones from PracticeAgent.',
      done: progress ? progress.totalQuizzesTaken > 0 : false,
      tab: 'practice'
    },
    {
      title: 'Submit and Auto-Grading Portfolio project',
      desc: 'Push coding files and receive Senior PR reviews.',
      done: progress ? progress.projectsCompleted > 0 : false,
      tab: 'projects'
    },
    {
      title: 'Conclude active technical simulation interview',
      desc: 'Verify concepts under mock architectural loops.',
      done: progress ? progress.interviewsCompleted > 0 : false,
      tab: 'interviews'
    }
  ];

  if (loading && !progress) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Assembling dashboard analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60 border border-slate-800 text-left relative overflow-hidden">
        <div className="absolute right-[-5%] top-[-5%] w-[40%] h-[120%] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-2xl">
          <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded">
            Student Space Dashboard
          </span>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white mt-3">
            Welcome back, <span className="text-indigo-400">{profile?.name || 'Academic Explorer'}</span>!
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed mt-2 font-light">
            {profile 
              ? `You are on the adaptive learning roadmap to master "${profile.targetCareer}". Master each milestone concept, project exercise, and mock interview to complete your curriculum.`
              : 'Unlock your collaborative AI Agent team by filling out your target career objective and skill history inside the Profile tab.'}
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card p-6 rounded-2xl text-left border border-slate-900/80 hover:border-indigo-500/30 transition-all duration-300 flex justify-between items-center group relative overflow-hidden cursor-default shadow-md hover:shadow-indigo-500/5"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">{card.title}</span>
                <span className="text-3xl font-display font-black text-white block tracking-tight">{card.value}</span>
                <span className="text-[10px] text-slate-400 font-light block leading-snug">{card.desc}</span>
              </div>
              <div className={`p-3.5 rounded-2xl border border-white/5 transition-transform duration-500 group-hover:rotate-6 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Setup checklist */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl text-left space-y-5 border border-slate-900">
          <div className="pb-3 border-b border-slate-900/60">
            <h3 className="font-display font-bold text-lg text-white">Your Educational Journey Checklist</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1 font-light">Complete active modules sequentially to unlock other system agent capabilities.</p>
          </div>

          <div className="space-y-3">
            {getChecklistItems().map((item, idx) => (
              <motion.div
                key={idx}
                onClick={() => onNavigateToTab(item.tab)}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl bg-slate-950/30 border border-slate-900/60 hover:border-indigo-500/20 hover:bg-slate-900/20 transition-all duration-300 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start gap-4 min-w-0 pr-3">
                  <span className={`p-1.5 rounded-xl shrink-0 transition-colors duration-300 ${
                    item.done 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-900 border border-slate-800 text-slate-600 group-hover:border-indigo-500/30 group-hover:text-indigo-400'
                  }`}>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold leading-snug transition-colors duration-300 ${
                      item.done 
                        ? 'text-slate-500 line-through' 
                        : 'text-slate-200 group-hover:text-indigo-300'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal truncate mt-1 font-light">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-all duration-300 group-hover:translate-x-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick summary stats for Hacker Board */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="glass-card p-6 rounded-3xl text-left space-y-4 flex-grow border border-slate-900">
            <h3 className="font-display font-bold text-base text-white pb-3 border-b border-slate-900">
              Agent Collaborative Hierarchy
            </h3>
            <div className="space-y-3.5 text-[11px] leading-relaxed font-light text-slate-400 font-sans">
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">🎓</span>
                <span><span className="font-semibold text-white">ProfileAgent</span> analyzes raw background and saves core interests.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">🚨</span>
                <span><span className="font-semibold text-white">SkillGapAgent</span> compiles missing topics.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">🧠</span>
                <span><span className="font-semibold text-white">LearningPathAgent</span> schemas custom roadmap milestones.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">💬</span>
                <span><span className="font-semibold text-white">TutorAgent</span> conducts Conversational RAG explanations.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">📝</span>
                <span><span className="font-semibold text-white">PracticeAgent</span> generates dynamic MCQ concept checks.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">💻</span>
                <span><span className="font-semibold text-white">ProjectAgent</span> reviews portfolio PR links.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">🎙️</span>
                <span><span className="font-semibold text-white">InterviewAgent</span> runs mock terminal interview simulations.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="text-sm select-none">🏆</span>
                <span><span className="font-semibold text-white">ProgressAgent</span> unlocks subsequent nodes on scores.</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3.5">
            <Cpu className="h-5 w-5 text-indigo-400 shrink-0 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Platform Engine Active</p>
              <p className="text-[10px] text-slate-400 font-light mt-0.5 leading-normal">
                Structured JSON schema mode enabled across all model endpoints for consistent evaluation scoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
