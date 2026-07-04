import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Compass, ShieldAlert, CheckCircle, Award, BrainCircuit, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';
import { Profile, Assessment } from '../types';

interface ProfileAssessmentProps {
  token: string;
  onProfileUpdated: () => void;
}

export default function ProfileAssessment({ token, onProfileUpdated }: ProfileAssessmentProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetCareer, setTargetCareer] = useState('');
  const [goals, setGoals] = useState('');
  const [rawBackground, setRawBackground] = useState('');

  const fetchProfileAndAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Get Profile
      const profRes = await fetch('/api/profile', { headers });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setName(profData.name || '');
        setTargetCareer(profData.targetCareer || '');
        setGoals(profData.goals || '');
        setRawBackground(profData.rawBackground || '');
      }

      // Get Assessment
      const assRes = await fetch('/api/assessment', { headers });
      if (assRes.ok) {
        const assData = await assRes.json();
        setAssessment(assData);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndAssessment();
  }, [token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetCareer || !goals || !rawBackground) {
      setError('Please fill in all profile fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, targetCareer, goals, rawBackground }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile.');
      }

      const updated = await response.json();
      setProfile(updated);
      onProfileUpdated();
      
      // Post profile save, suggest running assessment automatically
      setError('Profile configured successfully! Trigger the Skill Gap Assessment below to run AI diagnostics.');
    } catch (err: any) {
      setError(err.message || 'Error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async () => {
    setAssessing(true);
    setError(null);
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Assessment failed to evaluate.');
      }

      const result = await response.json();
      setAssessment(result);
      onProfileUpdated(); // reload roadmap changes triggered by assessment
    } catch (err: any) {
      setError(err.message || 'Error running Skill Gap Assessment.');
    } finally {
      setAssessing(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Accessing profile records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Student Diagnostics Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct your career objective to fuel the automated agent roadmap and tutoring engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-indigo-400 flex items-center gap-1.5">
            <Cpu className="h-3 w-3" /> ProfileAgent + SkillGapAgent
          </span>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-xl border text-xs ${error.includes('successfully') ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-rose-500/30 bg-rose-500/5 text-rose-300'}`}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Setup Form */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-900">
            <User className="h-5 w-5 text-indigo-400" />
            <h3 className="font-display font-semibold text-white">Profile & Goals Setup</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Target Career Role
              </label>
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="e.g. Full-Stack React Engineer, AI Engineer"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Core Goals
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Master Typescript, build highly interactive single-page dashboards, secure a high-paying software role."
                rows={3}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Current Background & Level
              </label>
              <textarea
                value={rawBackground}
                onChange={(e) => setRawBackground(e.target.value)}
                placeholder="e.g. Junior CSS & HTML coder. Basic Javascript loop logic understood, but completely new to server architectures, REST routers, and RAG."
                rows={4}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                'Save & Analyze Background'
              )}
            </button>
          </form>
        </div>

        {/* AI Agent Diagnostics & Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Results */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl space-y-5"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <Compass className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-display font-semibold text-white">Profile Evaluation</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Last Updated: {new Date(profile.updatedOn).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Strengths Detected
                  </h4>
                  {profile.strengths?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {profile.strengths.map((str, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-indigo-400 text-lg leading-[0.5]">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Analysis pending profile diagnostics...</span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                  <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Key Areas For Development
                  </h4>
                  {profile.weaknesses?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {profile.weaknesses.map((weak, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-indigo-400 text-lg leading-[0.5]">•</span> {weak}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Analysis pending profile diagnostics...</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Skill Gap Results */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-900">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                <h3 className="font-display font-semibold text-white">Dynamic Skill Gap Analysis</h3>
              </div>
              
              <button
                onClick={handleRunAssessment}
                disabled={assessing || !profile}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {assessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Run Gap Assessment
                  </>
                )}
              </button>
            </div>

            {!profile ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
                Please save your goals on the left form first to unlock the Skill Gap Assessment agent.
              </div>
            ) : !assessment ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                Ready to evaluate! Click the "Run Gap Assessment" button to trigger the <span className="font-semibold text-rose-300">SkillGapAgent</span>.
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Scorecards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Concept Ratings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assessment.results?.map((res, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900/30 border border-slate-900 flex justify-between items-center">
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="text-xs font-semibold text-white truncate">{res.topic}</p>
                          <p className="text-[10px] text-slate-500 leading-normal truncate">{res.description}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono font-bold text-indigo-400">{res.rating}/10</span>
                          <div className="w-12 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${res.rating * 10}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills list */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2.5">
                  <h4 className="text-xs font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Gaps Identified (Syllabus Missing)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.missingSkills?.map((skill, i) => (
                      <span key={i} className="text-[10px] font-mono font-medium px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-rose-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Path advice */}
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                  <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BrainCircuit className="h-3.5 w-3.5" /> Recommended Path Objective
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {assessment.recommendedPath}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
