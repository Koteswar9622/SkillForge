import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Lock, Play, CheckCircle, RefreshCw, Layers, Award, Clock, ArrowRight, HelpCircle, Laptop, GraduationCap } from 'lucide-react';
import { LearningPath, RoadmapNode } from '../types';

interface RoadmapViewProps {
  token: string;
  onNavigateToTab: (tab: string, nodeId?: string) => void;
  roadmapTrigger: number;
}

export default function RoadmapView({ token, onNavigateToTab, roadmapTrigger }: RoadmapViewProps) {
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [completingNodeId, setCompletingNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/roadmap', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve learning path roadmap.');
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || 'Error pulling roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [token, roadmapTrigger]);

  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate roadmap with AI.');
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || 'Error generating roadmap.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleForceCompleteNode = async (nodeId: string) => {
    setCompletingNodeId(nodeId);
    setError(null);
    try {
      const response = await fetch('/api/roadmap/complete-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nodeId }),
      });

      if (!response.ok) {
        throw new Error('Could not mark concept node complete.');
      }

      const data = await response.json();
      setRoadmap(data.roadmap);
    } catch (err: any) {
      setError(err.message || 'Error completing node.');
    } finally {
      setCompletingNodeId(null);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'concept':
        return GraduationCap;
      case 'quiz':
        return HelpCircle;
      case 'project':
        return Laptop;
      case 'interview':
        return Award;
      default:
        return Layers;
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'concept':
        return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
      case 'quiz':
        return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
      case 'project':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'interview':
        return 'text-sky-400 border-sky-500/20 bg-sky-500/5';
      default:
        return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  if (loading && !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Assembling your interactive path timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Roadmap Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl text-white">Dynamic AI Roadmap</h1>
          <p className="text-xs text-slate-400">
            Automated concept path matching. Unlock nodes sequentially by scoring &gt;= 60% on Quizzes and Projects.
          </p>
        </div>
        
        {roadmap && (
          <button
            onClick={handleRegenerateRoadmap}
            disabled={regenerating}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {regenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Forging New Path...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate Roadmap
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {!roadmap ? (
        <div className="glass-card p-10 rounded-2xl text-center space-y-4 border border-dashed border-slate-800">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mx-auto">
            <BrainCircuit className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-display font-semibold text-white text-lg">No Learning Path Generated</h3>
            <p className="text-xs text-slate-400">
              Please complete your initial career goals and target role inside the **Profile Diagnostics** screen first. Once completed, your roadmap will auto-generate.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('profile')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            Go to Profile Setup
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Tracker Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Target Career Role</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">{roadmap.targetCareer}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Path Progress</p>
                <p className="text-sm font-semibold text-white mt-1">{roadmap.currentProgress}% Complete</p>
              </div>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${roadmap.currentProgress}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Interactive Milestones</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {roadmap.nodes?.filter(n => n.status === 'completed').length} / {roadmap.nodes?.length} Nodes
                </p>
              </div>
            </div>
          </div>

          {/* Sequential Timeline Nodes */}
          <div className="relative border-l-2 border-slate-900/50 ml-5 pl-8 space-y-8">
            <div className="absolute top-0 bottom-0 left-[-2px] w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-slate-950 pointer-events-none" />
            {roadmap.nodes?.sort((a, b) => a.order - b.order).map((node, i) => {
              const NodeIcon = getNodeIcon(node.type);
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={node.status !== 'locked' ? { y: -3, scale: 1.01 } : undefined}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                    node.status === 'locked'
                      ? 'bg-slate-950/10 border-slate-900/30 opacity-40 select-none'
                      : node.status === 'active'
                      ? 'bg-gradient-to-r from-indigo-950/10 via-slate-900/30 to-slate-900/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                      : 'bg-slate-900/20 border-emerald-500/15 shadow-sm shadow-emerald-500/2'
                  }`}
                >
                  {/* Left Timeline Indicator */}
                  <span className={`absolute -left-[42px] top-6.5 flex h-7.5 w-7.5 rounded-full border items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    node.status === 'locked'
                      ? 'bg-slate-950 border-slate-900 text-slate-600'
                      : node.status === 'active'
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/20 scale-110'
                      : 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/10'
                  }`}>
                    {node.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : node.status === 'locked' ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      node.order
                    )}
                  </span>

                  {/* Node Type & Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 uppercase tracking-wider ${getNodeTypeColor(node.type)}`}>
                        <NodeIcon className="h-3 w-3" /> {node.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {node.duration}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      node.status === 'locked'
                        ? 'bg-slate-900 text-slate-500 border border-slate-800'
                        : node.status === 'active'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Core Details */}
                  <h3 className="font-display font-bold text-white text-lg mb-2">{node.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl mb-5 font-light">
                    {node.description}
                  </p>

                  {/* Skills Tagged */}
                  {node.skillsAcquired?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {node.skillsAcquired.map((skill, si) => (
                        <span key={si} className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  {node.status !== 'locked' && (
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-900">
                      {node.type === 'concept' && (
                        <>
                          <button
                            onClick={() => onNavigateToTab('tutor', node.title)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                          >
                            Tutor Node <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          {node.status === 'active' && (
                            <button
                              onClick={() => handleForceCompleteNode(node.id)}
                              disabled={completingNodeId === node.id}
                              className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                            >
                              {completingNodeId === node.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                              )}
                              Mark Concept Done
                            </button>
                          )}
                        </>
                      )}

                      {node.type === 'quiz' && (
                        <button
                          onClick={() => onNavigateToTab('practice', node.id)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/15 hover:shadow-purple-600/30 transition-all hover:scale-[1.02]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Launch Practice Quiz
                        </button>
                      )}

                      {node.type === 'project' && (
                        <button
                          onClick={() => onNavigateToTab('projects', node.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Generate & Build Project
                        </button>
                      )}

                      {node.type === 'interview' && (
                        <button
                          onClick={() => onNavigateToTab('interviews', node.id)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-600/15 hover:shadow-sky-600/30 transition-all hover:scale-[1.02]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Start Mock Interview
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
