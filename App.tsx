import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuizSession from './components/QuizSession';
import ResultSummary from './components/ResultSummary';
import MasteryMap from './components/MasteryMap';
import { UserProgress, AppView, Subject, TopicNode, Question } from './types';
import { INITIAL_PROGRESS, XP_PER_CORRECT } from './constants';
import { GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{correctCount: number; total: number; failedQuestions: Question[]} | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
      if (!process.env.API_KEY) {
          setApiKeyMissing(true);
      }
  }, []);

  const handleViewChange = (newView: AppView, subject?: Subject) => {
    if (subject) {
        setSelectedSubject(subject);
        // Clear topics when selecting from dashboard quick start
        setSelectedTopics([]); 
    }
    setView(newView);
  };

  const handleTopicSelect = (topic: TopicNode) => {
      setSelectedSubject(topic.subject);
      setSelectedTopics([topic.name]); // Use name for generation context
      setView(AppView.QUIZ_SESSION);
  };

  const handleQuizComplete = (result: { correctCount: number; total: number; failedQuestions: Question[] }) => {
    // Update Progress
    const earnedXP = result.correctCount * XP_PER_CORRECT;
    const weakTags = [...new Set(result.failedQuestions.map(q => q.topicTag))];

    setProgress(prev => {
        const newSubjectMastery = { ...prev.subjectMastery };
        // Simple mastery increment logic
        if (result.correctCount > 0) {
            newSubjectMastery[selectedSubject] = Math.min(100, newSubjectMastery[selectedSubject] + (result.correctCount * 2));
        }
        
        return {
            ...prev,
            xp: prev.xp + earnedXP,
            level: Math.floor((prev.xp + earnedXP) / 500) + 1,
            subjectMastery: newSubjectMastery,
            recentActivity: [
                {
                    totalQuestions: result.total,
                    correctCount: result.correctCount,
                    timestamp: Date.now(),
                    subject: selectedSubject,
                    weakTopics: weakTags
                },
                ...prev.recentActivity.slice(0, 4) // Keep last 5
            ]
        };
    });

    setLastResult(result);
    setView(AppView.QUIZ_RESULT);
  };

  if (apiKeyMissing) {
       return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4">
              <div className="max-w-md text-center space-y-4">
                  <h1 className="text-2xl font-bold text-rose-500">Configuration Error</h1>
                  <p>API_KEY is missing from the environment variables.</p>
                  <p className="text-sm text-slate-400">Please ensure `process.env.API_KEY` is available to connect to Gemini API.</p>
              </div>
          </div>
       )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8">
        <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView(AppView.DASHBOARD)}
        >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <GraduationCap size={24} className="text-white" />
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight">科學班衝刺助手</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">AI-POWERED PREP</p>
            </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-400">
            <button onClick={() => setView(AppView.DASHBOARD)} className={`hover:text-white transition-colors ${view === AppView.DASHBOARD ? 'text-indigo-400' : ''}`}>儀表板</button>
            <button onClick={() => setView(AppView.MASTERY_MAP)} className={`hover:text-white transition-colors ${view === AppView.MASTERY_MAP ? 'text-indigo-400' : ''}`}>知識地圖</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        
        <div className="h-full w-full relative z-10 flex flex-col">
            {view === AppView.DASHBOARD && (
                <Dashboard progress={progress} onChangeView={handleViewChange} />
            )}

            {view === AppView.QUIZ_SETUP && (
                // Quick transition to session for now, usually a setup screen goes here
                <QuizSession 
                    subject={selectedSubject} 
                    topics={selectedTopics}
                    onComplete={handleQuizComplete}
                    onExit={() => setView(AppView.DASHBOARD)}
                />
            )}

            {view === AppView.QUIZ_SESSION && (
                <QuizSession 
                    subject={selectedSubject} 
                    topics={selectedTopics}
                    onComplete={handleQuizComplete}
                    onExit={() => setView(AppView.DASHBOARD)}
                />
            )}

            {view === AppView.QUIZ_RESULT && lastResult && (
                <ResultSummary 
                    result={lastResult} 
                    subject={selectedSubject}
                    onHome={() => setView(AppView.DASHBOARD)}
                    onRetry={() => setView(AppView.QUIZ_SESSION)}
                />
            )}

            {view === AppView.MASTERY_MAP && (
                <MasteryMap 
                    masteryData={progress.topicMastery} 
                    onSelectTopic={handleTopicSelect}
                    onBack={() => setView(AppView.DASHBOARD)}
                />
            )}
        </div>
      </main>
    </div>
  );
};

export default App;
