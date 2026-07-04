import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, RefreshCw, ChevronRight, CheckCircle, AlertTriangle, HelpCircle as QuestionIcon, Award, Compass, Sparkles } from 'lucide-react';
import { Quiz, QuizQuestion } from '../types';

interface QuizViewProps {
  token: string;
  nodeId?: string;
  onQuizCompleted: () => void;
  onNavigateToRoadmap: () => void;
}

export default function QuizView({ token, nodeId, onQuizCompleted, onNavigateToRoadmap }: QuizViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz active state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!nodeId) return;
    setLoading(true);
    setError(null);
    setReviewMode(false);
    setCurrentIdx(0);
    setSelectedAnswers([]);
    setShowHint(false);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nodeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate practice quiz for this node.');
      }

      const data = await response.json();
      setQuiz(data);
      setSelectedAnswers(new Array(data.questions.length).fill(-1));
    } catch (err: any) {
      setError(err.message || 'Error generating quiz.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nodeId) {
      handleGenerateQuiz();
    }
  }, [nodeId]);

  const handleSelectOption = (optIndex: number) => {
    if (reviewMode) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optIndex;
    setSelectedAnswers(updated);
    setShowHint(false);
  };

  const handleNextQuestion = () => {
    if (currentIdx < (quiz?.questions.length || 0) - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowHint(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowHint(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    // Check if any question remains unanswered
    if (selectedAnswers.includes(-1)) {
      setError('Please answer all quiz questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: selectedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit and score quiz.');
      }

      const scored = await response.json();
      setQuiz((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          results: scored.results,
          questions: scored.questions, // updated with answers & explanations
        };
      });
      setReviewMode(true);
      onQuizCompleted();
    } catch (err: any) {
      setError(err.message || 'Error scoring quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <span className="font-mono text-xs">Generating custom adaptive quiz via PracticeAgent...</span>
      </div>
    );
  }

  if (!nodeId) {
    return (
      <div className="glass-card p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto border border-dashed border-slate-800">
        <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 w-fit mx-auto">
          <HelpCircle className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-lg">No Active Quiz</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Navigate to the **Learning Roadmap** tab and click "Launch Practice Quiz" on any active quiz node to evaluate your concepts.
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

  if (!quiz) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-xs text-rose-300">⚠️ Failed to load or render quiz structures.</p>
        <button
          onClick={handleGenerateQuiz}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-medium cursor-pointer"
        >
          Retry Generating Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800">
        <div>
          <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
            Interactive Quiz
          </span>
          <h2 className="font-display font-bold text-xl text-white mt-1.5">{quiz.title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Scored out of 100%. Master concept with 60% score or more to unlock next paths.</p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-purple-400 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" /> PracticeAgent Model
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Results / Review Summary */}
      {reviewMode && quiz.results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
            quiz.results.passed
              ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-200'
              : 'border-rose-500/20 bg-rose-500/5 text-slate-200'
          }`}
        >
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2 justify-center sm:justify-start">
              {quiz.results.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Milestone Passed!
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-400" /> Improvement Recommended
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-light max-w-md leading-relaxed">
              {quiz.results.passed
                ? 'Excellent work! The governance agent has validated your quiz responses and unlocked the subsequent node in your roadmap.'
                : 'Your score was below the passing threshold of 60%. Please review the questions and explanations below, refresh your concepts in the Tutor Chat, and try again!'}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Your score</span>
            <span className={`text-4xl font-display font-black mt-1 ${quiz.results.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {quiz.results.score}%
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">Passing: 60%</span>
          </div>
        </motion.div>
      )}

      {/* Question Card Console */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        {/* Progress Tracker */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-900/60 text-xs">
          <span className="font-mono text-slate-500">
            Question <span className="text-white font-semibold">{currentIdx + 1}</span> of {quiz.questions.length}
          </span>
          <div className="w-1/3 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-white text-base md:text-lg leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIdx] === idx;
            const isCorrect = currentQuestion.answerIndex === idx;
            const wasSelectedAndIncorrect = isSelected && !isCorrect;
            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...

            let cardStyles = 'border-slate-900 bg-slate-950/30 hover:bg-slate-900/30 hover:border-slate-700/60 text-slate-300';
            let indexBadgeStyles = 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-white';

            if (isSelected && !reviewMode) {
              cardStyles = 'border-purple-500/60 bg-purple-500/10 text-purple-200 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/20';
              indexBadgeStyles = 'bg-purple-600 text-white border-purple-400/20';
            } else if (reviewMode) {
              if (isCorrect) {
                cardStyles = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium';
                indexBadgeStyles = 'bg-emerald-600 text-white border-emerald-400/20';
              } else if (wasSelectedAndIncorrect) {
                cardStyles = 'border-rose-500/40 bg-rose-500/10 text-rose-300';
                indexBadgeStyles = 'bg-rose-600 text-white border-rose-400/20';
              } else {
                cardStyles = 'border-slate-900/40 bg-slate-950/10 opacity-50';
                indexBadgeStyles = 'bg-slate-950 border-slate-900 text-slate-600';
              }
            }

            return (
              <motion.button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                whileHover={!reviewMode ? { y: -1, x: 2 } : undefined}
                whileTap={!reviewMode ? { scale: 0.99 } : undefined}
                className={`w-full p-4 rounded-2xl border text-xs text-left transition-all duration-200 flex items-center justify-between cursor-pointer group ${cardStyles}`}
                disabled={reviewMode}
              >
                <div className="flex items-center gap-4">
                  <span className={`h-6.5 w-6.5 rounded-xl border flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 shrink-0 ${indexBadgeStyles}`}>
                    {optionLetter}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </div>
                {reviewMode && isCorrect && <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 ml-2" />}
                {reviewMode && wasSelectedAndIncorrect && <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 ml-2" />}
              </motion.button>
            );
          })}
        </div>

        {/* Hint helper */}
        {!reviewMode && (
          <div className="pt-2">
            {showHint ? (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-[11px] leading-relaxed text-indigo-300 font-light flex items-start gap-2"
              >
                <Compass className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                <span>💡 **Practice Agent Hint**: {currentQuestion.hint}</span>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer underline underline-offset-4"
              >
                Need assistance? Request an AI Hint
              </button>
            )}
          </div>
        )}

        {/* Explanation helper during review */}
        {reviewMode && currentQuestion.explanation && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 text-[11px] leading-relaxed text-slate-300 font-light space-y-1">
            <p className="font-mono text-slate-400 font-semibold uppercase">Explanatory Review:</p>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-900/60 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentIdx === quiz.questions.length - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>

          {!reviewMode ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" /> Scoring Answers...
                </>
              ) : (
                <>
                  Submit Evaluation <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNavigateToRoadmap}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              Finish Review & Return to Roadmap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
