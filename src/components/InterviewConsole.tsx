import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, RefreshCw, Award, MessageSquare, AlertCircle, Sparkles, CheckCircle2, ArrowRight, UserCheck, HelpCircle } from 'lucide-react';
import { Interview } from '../types';

interface InterviewConsoleProps {
  token: string;
  onNavigateToRoadmap: () => void;
}

export default function InterviewConsole({ token, onNavigateToRoadmap }: InterviewConsoleProps) {
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Loop State
  const [answerInput, setAnswerInput] = useState('');

  const fetchPastInterviews = async () => {
    try {
      const response = await fetch('/api/interview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPastInterviews(data);
        
        // Find if any interview is currently active
        const active = data.find((inv: Interview) => inv.status === 'active');
        if (active) {
          setActiveInterview(active);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPastInterviews();
  }, [token]);

  const handleStartInterview = async () => {
    setLoading(true);
    setError(null);
    setAnswerInput('');

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate career mock interview loop.');
      }

      const data = await response.json();
      setActiveInterview(data);
      fetchPastInterviews();
    } catch (err: any) {
      setError(err.message || 'Error spawning mock interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterview || !answerInput.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId: activeInterview.id,
          answer: answerInput,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit answer to evaluator.');
      }

      const updated = await response.json();
      setActiveInterview(updated);
      setAnswerInput('');
      fetchPastInterviews();
    } catch (err: any) {
      setError(err.message || 'Error processing response.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Spawning active mock simulation cycle via InterviewAgent...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Console Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800">
        <div>
          <span className="text-[9px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
            Interactive Simulator
          </span>
          <h2 className="font-display font-bold text-xl text-white mt-1.5">AI Technical Interview Console</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Test your logic on career-oriented engineering problems with live scoring metrics.</p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-400 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" /> InterviewAgent Model
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Board view */}
      {!activeInterview ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Landing Intro */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl text-left space-y-5">
            <h3 className="font-display font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-900">
              <Terminal className="h-4 w-4 text-sky-400" /> Start Career Simulation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Enter the simulation environment. Our **InterviewAgent** acts as a senior principal architect, probing your choices, assessing system architectural awareness, testing API configurations, and evaluating clean code constraints.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-900 flex gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300">Targeted questions tailored directly to your profile's objective.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-900 flex gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300">Micro-feedback reviews on every single answer you submit.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-900 flex gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300">Final scorecard with grade percentages and clear target topics to practice further.</p>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
            >
              Initialize Mock Interview Loop <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Past Evaluations list */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl text-left space-y-4">
            <h3 className="font-display font-semibold text-white pb-3 border-b border-slate-900">
              Evaluations Archive
            </h3>
            <div className="space-y-3 max-h-[290px] overflow-y-auto">
              {pastInterviews.filter(p => p.status === 'completed').length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No past interviews archived.</p>
              ) : (
                pastInterviews.filter(p => p.status === 'completed').map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-900/30 border border-slate-900 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-white truncate max-w-[140px]">{p.careerTarget}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.answers?.length} Questions graded</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sky-400 font-bold">{p.overallScore}% Score</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Archived</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview Console Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Active Question Terminal & input form */}
          <div className="lg:col-span-7 flex flex-col justify-between glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  ACTIVE FEED QUESTION {activeInterview.currentQuestionIndex + 1} OF 5
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              </div>

              {activeInterview.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center space-y-2">
                    <Award className="h-8 w-8 text-sky-400 mx-auto" />
                    <h4 className="font-display font-semibold text-white text-base">Simulation Loop Concluded!</h4>
                    <p className="text-xs text-slate-300 font-light">
                      The interview loop completed. Your overall average score is <span className="font-semibold text-sky-400">{activeInterview.overallScore}%</span>. Check the dynamic PR scorecard comments on the side.
                    </p>
                  </div>

                  {activeInterview.overallFeedback && (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 space-y-1.5">
                      <p className="text-[10px] font-mono text-sky-400 uppercase font-semibold">Overall feedback advice:</p>
                      <p className="text-xs text-slate-300 leading-relaxed font-light font-sans">{activeInterview.overallFeedback}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleStartInterview}
                      className="flex-grow py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Start Fresh Mock Simulation
                    </button>
                    <button
                      onClick={onNavigateToRoadmap}
                      className="flex-grow py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                    >
                      Return to Roadmap
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Current Active Question Display */}
                  <div className="p-4.5 rounded-xl bg-slate-950 border border-slate-900 text-sm font-mono text-sky-300 leading-relaxed shadow-inner">
                    <span className="text-slate-500 select-none">{`$ `}</span>
                    {activeInterview.questions[activeInterview.currentQuestionIndex]}
                  </div>

                  {/* Submission form */}
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                        Enter your technical answer response:
                      </label>
                      <textarea
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="Draft your detailed answer. Describe architecture details, code snippets, or rationale."
                        rows={6}
                        className="w-full glass-input px-3.5 py-3 rounded-xl text-xs font-mono"
                        disabled={submitting}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !answerInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Submitting response to Evaluation Agent...
                        </>
                      ) : (
                        <>
                          Submit Technical Answer <Send className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Live Evaluator feedback feed */}
          <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between overflow-hidden h-[420px] lg:h-auto">
            <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
              <h3 className="font-display font-semibold text-white text-sm pb-2.5 border-b border-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-sky-400" /> Live Evaluator Feed
              </h3>

              {activeInterview.answers?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                  <Terminal className="h-6 w-6 mb-2 text-slate-600 animate-pulse" />
                  <p className="text-xs font-light">Questions are active. Submit your response to view live feedback loops.</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {activeInterview.answers.map((ans, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500">QUESTION {idx + 1} GRADED</span>
                        <span className="text-xs font-mono font-bold text-sky-400">{ans.score}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                        <span className="font-semibold text-slate-300">Your Ans:</span> "{ans.answer}"
                      </p>
                      <div className="p-2 rounded bg-sky-500/5 text-[10px] text-sky-300 font-light border border-sky-500/10 leading-relaxed">
                        💡 <span className="font-semibold">Review:</span> {ans.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-sky-400 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-snug">
                This evaluator validates specific criteria including syntax precision, structural choices, scalability, and execution logic.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
