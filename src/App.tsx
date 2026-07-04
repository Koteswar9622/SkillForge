import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import ProfileAssessment from './components/ProfileAssessment';
import RoadmapView from './components/RoadmapView';
import TutorChat from './components/TutorChat';
import QuizView from './components/QuizView';
import ProjectLab from './components/ProjectLab';
import InterviewConsole from './components/InterviewConsole';
import { User, Profile } from './types';
import { Sparkles, Terminal, Menu } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('forge_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('forge_user') ? JSON.parse(localStorage.getItem('forge_user')!) : null
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>(token ? 'overview' : 'landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Node navigation linkages
  const [selectedQuizNodeId, setSelectedQuizNodeId] = useState<string | undefined>(undefined);
  const [selectedProjectNodeId, setSelectedProjectNodeId] = useState<string | undefined>(undefined);
  const [selectedTutorTopic, setSelectedTutorTopic] = useState<string | undefined>(undefined);

  // Synchronizers
  const [roadmapTrigger, setRoadmapTrigger] = useState(0);
  const [progressTrigger, setProgressTrigger] = useState(0);

  // Fetch Current Profile
  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to load user profile on startup:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: { id: string; email: string }) => {
    localStorage.setItem('forge_token', newToken);
    localStorage.setItem('forge_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchUserProfile(newToken);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    localStorage.removeItem('forge_token');
    localStorage.removeItem('forge_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    setActiveTab('landing');
  };

  const handleResetAccount = async () => {
    if (!token) return;
    const confirmReset = window.confirm("Are you absolutely sure you want to completely reset your account and learning history? This will delete your profile, roadmap progress, assessments, tutor chat history, submitted projects, and mock interviews. This action is permanent and cannot be undone.");
    if (!confirmReset) return;

    try {
      const response = await fetch('/api/reset-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Your account and learning data have been successfully reset!');
        handleLogout();
      } else {
        alert(data.error || 'Failed to reset account.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred during account reset.');
    }
  };

  // Safe navigation that accepts node-specific arguments
  const handleNavigateToTab = (tabId: string, nodeIdOrTopic?: string) => {
    if (tabId === 'practice' && nodeIdOrTopic) {
      setSelectedQuizNodeId(nodeIdOrTopic);
    } else if (tabId === 'projects' && nodeIdOrTopic) {
      setSelectedProjectNodeId(nodeIdOrTopic);
    } else if (tabId === 'tutor' && nodeIdOrTopic) {
      setSelectedTutorTopic(nodeIdOrTopic);
    }
    setActiveTab(tabId);
  };

  const handleProfileUpdated = () => {
    if (token) {
      fetchUserProfile(token);
    }
    setRoadmapTrigger((prev) => prev + 1);
    setProgressTrigger((prev) => prev + 1);
  };

  const handleQuizCompleted = () => {
    setRoadmapTrigger((prev) => prev + 1);
    setProgressTrigger((prev) => prev + 1);
  };

  const handleProjectCompleted = () => {
    setRoadmapTrigger((prev) => prev + 1);
    setProgressTrigger((prev) => prev + 1);
  };

  const renderActiveTab = () => {
    if (!token || !user) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            token={token}
            profile={profile}
            onNavigateToTab={handleNavigateToTab}
            progressTrigger={progressTrigger}
          />
        );
      case 'profile':
        return (
          <ProfileAssessment
            token={token}
            onProfileUpdated={handleProfileUpdated}
          />
        );
      case 'roadmap':
        return (
          <RoadmapView
            token={token}
            onNavigateToTab={handleNavigateToTab}
            roadmapTrigger={roadmapTrigger}
          />
        );
      case 'tutor':
        return (
          <TutorChat
            token={token}
            initialTopic={selectedTutorTopic}
            onClearTopic={() => setSelectedTutorTopic(undefined)}
          />
        );
      case 'practice':
        return (
          <QuizView
            token={token}
            nodeId={selectedQuizNodeId}
            onQuizCompleted={handleQuizCompleted}
            onNavigateToRoadmap={() => setActiveTab('roadmap')}
          />
        );
      case 'projects':
        return (
          <ProjectLab
            token={token}
            nodeId={selectedProjectNodeId}
            onProjectCompleted={handleProjectCompleted}
            onNavigateToRoadmap={() => setActiveTab('roadmap')}
          />
        );
      case 'interviews':
        return (
          <InterviewConsole
            token={token}
            onNavigateToRoadmap={() => setActiveTab('roadmap')}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-500 text-xs font-mono">
            View Selection Pending...
          </div>
        );
    }
  };

  // 1. Landing Screen
  if (activeTab === 'landing' && !token) {
    return (
      <LandingPage
        onStart={() => setActiveTab('auth')}
        onGoToAuth={() => setActiveTab('auth')}
      />
    );
  }

  // 2. Auth Screen
  if (activeTab === 'auth' && !token) {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onGoBack={() => setActiveTab('landing')}
      />
    );
  }

  // 3. Authenticated Admin Dashboard Layout
  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-indigo-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-base tracking-tight text-white">
            Skill<span className="text-indigo-400">Forge</span>
          </span>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          // Clear sub-node filters on clean sidebar switches
          if (tab !== 'practice') setSelectedQuizNodeId(undefined);
          if (tab !== 'projects') setSelectedProjectNodeId(undefined);
          if (tab !== 'tutor') setSelectedTutorTopic(undefined);
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userEmail={user?.email || 'student@forge.com'}
        onLogout={handleLogout}
        onResetAccount={handleResetAccount}
      />

      {/* Dynamic Content Panel View */}
      <div className="flex-grow h-[calc(100vh-65px)] md:h-screen overflow-y-auto px-6 py-8 relative md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
