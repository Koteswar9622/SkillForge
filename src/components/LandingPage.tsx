import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass, ShieldAlert, Cpu, Award, MessageSquare, BookOpen, BrainCircuit, Terminal, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onGoToAuth: () => void;
}

export default function LandingPage({ onStart, onGoToAuth }: LandingPageProps) {
  const agents = [
    {
      name: 'Profile Agent',
      desc: 'Dissects career goals, previous tech background, and maps out targeted learning goals.',
      icon: Compass,
      color: 'text-indigo-400',
      badge: 'Analytical'
    },
    {
      name: 'Skill Gap Agent',
      desc: 'Pinpoints specific concepts and practical engineering gaps you need to master.',
      icon: ShieldAlert,
      color: 'text-rose-400',
      badge: 'Diagnostics'
    },
    {
      name: 'Learning Path Agent',
      desc: 'Forges customized roadmaps complete with modular lessons, assignments, and quizzes.',
      icon: BrainCircuit,
      color: 'text-amber-400',
      badge: 'Architect'
    },
    {
      name: 'Tutor Agent',
      desc: 'Conducts deep-dive explanations powered by interactive conversational RAG uploads.',
      icon: MessageSquare,
      color: 'text-teal-400',
      badge: 'Pedagogy'
    },
    {
      name: 'Practice Agent',
      desc: 'Generates rigorous coding challenges, multiple-choice concepts, and diagnostic hints.',
      icon: BookOpen,
      color: 'text-purple-400',
      badge: 'Adaptive'
    },
    {
      name: 'Project Agent',
      desc: 'Recommends production-grade portfolio projects and auto-reviews pull request submissions.',
      icon: Cpu,
      color: 'text-emerald-400',
      badge: 'Evaluator'
    },
    {
      name: 'Interview Agent',
      desc: 'Runs full interactive technical mock interviews with personalized scorecards and hints.',
      icon: Terminal,
      color: 'text-sky-400',
      badge: 'Simulations'
    },
    {
      name: 'Progress Agent',
      desc: 'Monitors user stats and scores, dynamically updating roadmap nodes and unlocking next paths.',
      icon: Award,
      color: 'text-pink-400',
      badge: 'Governance'
    },
  ];

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden bg-slate-950">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Skill<span className="text-indigo-400">Forge</span>
          </span>
        </div>
        <button
          onClick={onGoToAuth}
          className="px-5 py-2 rounded-xl text-sm font-medium border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-900 hover:text-white hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col items-center justify-center relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
            <Cpu className="h-3.5 w-3.5 animate-pulse" />
            Hackathon Version 1.0 — 8 Multi-Agent System Activated
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight mb-6">
            Forge Engineering Skills with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaptive AI Agents
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Stop studying general tutorials. SkillForge diagnostics identify your exact gaps, layout an automated roadmap, tutor you with interactive RAG files, and review your live projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onStart}
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#agents-grid"
              className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-white transition-all text-sm font-medium cursor-pointer"
            >
              Explore AI Agents
            </a>
          </div>
        </motion.div>

        {/* Live System Specs Tracker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-14 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md max-w-xl w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs text-slate-500">Vector Embeddings: Active</span>
          </div>
          <div className="font-mono text-xs text-slate-500">RAG Context Engine: Online</div>
          <div className="font-mono text-xs text-slate-500">Model: Gemini 2.0 Flash</div>
        </motion.div>

        {/* Agents Matrix Grid */}
        <section id="agents-grid" className="w-full pt-20 pb-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              Meet the 8 Collaborative Agents
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Each agent works autonomously or triggers others sequentially based on your assessment results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  className="glass-card p-6 rounded-2xl text-left hover:border-indigo-500/30 hover:scale-[1.01] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${agent.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {agent.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-base mb-2 group-hover:text-indigo-300 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    {agent.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900/80 bg-slate-950/60 py-6 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <span>&copy; {new Date().getFullYear()} SkillForge Learning Corporation. All rights reserved.</span>
          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
