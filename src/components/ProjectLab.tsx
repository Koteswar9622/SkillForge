import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Laptop, Cpu, Play, CheckCircle2, RefreshCw, AlertCircle, Sparkles, Code, GitBranch, Github, ShieldCheck, HelpCircle } from 'lucide-react';
import { Project } from '../types';

interface ProjectLabProps {
  token: string;
  nodeId?: string;
  onProjectCompleted: () => void;
  onNavigateToRoadmap: () => void;
}

export default function ProjectLab({ token, nodeId, onProjectCompleted, onNavigateToRoadmap }: ProjectLabProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [submissionLink, setSubmissionLink] = useState('');
  const [description, setDescription] = useState('');

  const handleGenerateProject = async () => {
    if (!nodeId) return;
    setLoading(true);
    setError(null);
    setSubmissionLink('');
    setDescription('');

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nodeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to recommend portfolio project spec.');
      }

      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Error creating project spec.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/project', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // If an array of projects is returned, find the active or newly recommended one for this nodeId
        if (Array.isArray(data) && data.length > 0) {
          const matched = nodeId ? data.find((p) => p.id === `proj_${nodeId}`) : data[0];
          setProject(matched || data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nodeId) {
      handleGenerateProject();
    } else {
      fetchActiveProject();
    }
  }, [nodeId]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!submissionLink || !description) {
      setError('GitHub Submission Link and Description of work are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/project/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          submissionLink,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit project for grading.');
      }

      setProject(data.project);
      onProjectCompleted();
    } catch (err: any) {
      setError(err.message || 'Error submitting project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Architecting production code assignments via ProjectAgent...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto border border-dashed border-slate-800">
        <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit mx-auto">
          <Laptop className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-lg">No Active Portfolio Project</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Explore the **Learning Roadmap** dashboard and trigger "Generate & Build Project" on any project milestone to unlock specialized assignments.
          </p>
        </div>
        <button
          onClick={onNavigateToRoadmap}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
        >
          View Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800">
        <div>
          <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
            Portfolio Lab Block
          </span>
          <h2 className="font-display font-bold text-xl text-white mt-1.5">{project.title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Solve actual industrial specifications and receive detailed AI PR code reviews.</p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" /> ProjectAgent Model
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Specifications & milestones */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4 text-left">
            <h3 className="font-display font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-900/60">
              <Code className="h-4 w-4 text-emerald-400" /> Functional Specification
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-900">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Tech Stack</span>
                <p className="text-xs text-slate-200 mt-1 font-semibold truncate">
                  {project.technologies?.join(', ') || 'Typescript, React, CSS'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-900">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Difficulty level</span>
                <p className="text-xs text-emerald-400 mt-1 font-semibold capitalize">
                  {project.difficulty}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone checklist */}
          <div className="glass-card p-6 rounded-2xl space-y-4 text-left">
            <h3 className="font-display font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-900/60">
              <GitBranch className="h-4 w-4 text-emerald-400" /> Guided Coding Milestones
            </h3>
            <div className="space-y-3">
              {project.milestones?.map((ms, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-900/30 border border-slate-900 flex items-start gap-3">
                  <span className={`p-1 rounded-lg ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-600'} shrink-0`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-normal">{ms.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-light">{ms.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: submission & scores */}
        <div className="lg:col-span-5 space-y-6">
          {/* PR Scorecard review if completed */}
          {project.status === 'completed' && project.score !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/10">
                <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" /> AI Code Approved
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/15 rounded">
                  Passed
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Project Review Grade:</span>
                <span className="text-2xl font-display font-black text-emerald-400">{project.score}/100</span>
              </div>

              {project.feedback && (
                <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                  <p className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">PR Review Comments:</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-light italic">
                    "{project.feedback}"
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Submission Panel */}
          {project.status !== 'completed' && (
            <div className="glass-card p-6 rounded-2xl space-y-4 text-left">
              <h3 className="font-display font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-900/60">
                <Github className="h-4 w-4 text-emerald-400" /> Portfolio Submission
              </h3>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                    GitHub Repository / Sandbox Link
                  </label>
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://github.com/yourprofile/repo"
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                    Provide Brief Description of Accomplishments
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly state how you solved the requirements, outline the folder structure you created, and summarize your design choices."
                    rows={4}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !submissionLink || !description}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Performing PR Evaluation...
                    </>
                  ) : (
                    'Submit to ProjectAgent'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* System notes */}
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 text-[10px] leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-400 block mb-1">📋 PR Submission Guardrails</span>
            The project agent will inspect your code details, assess structure, and automatically assign grades. Complete coding assignments to earn high skill points!
          </div>
        </div>
      </div>
    </div>
  );
}
