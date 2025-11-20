import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { UserProgress, Subject, AppView } from '../types';
import { SUBJECTS, XP_LEVEL_UP_BASE } from '../constants';
import { Trophy, Flame, Zap, Brain, ChevronRight } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onChangeView: (view: AppView, subject?: Subject) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, onChangeView }) => {
  // Prepare data for Radar Chart
  const chartData = Object.entries(SUBJECTS).map(([key, val]) => ({
    subject: val.label.replace('資優', '').replace('進階', '').replace('奧林匹亞', '').replace('高階', ''),
    fullMark: 100,
    score: progress.subjectMastery[key as Subject],
  }));

  const nextLevelXP = progress.level * XP_LEVEL_UP_BASE;
  const xpPercentage = Math.min(100, (progress.xp / nextLevelXP) * 100);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-4 space-y-6 overflow-y-auto pb-20">
      
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Trophy size={20} />
            <span className="font-bold text-lg">Lv. {progress.level}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">{progress.xp} / {nextLevelXP} XP</div>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center backdrop-blur-sm">
           <div className="flex items-center gap-2 text-rose-500 mb-1">
            <Flame size={20} />
            <span className="font-bold text-lg">{progress.streak} 天</span>
          </div>
          <span className="text-xs text-slate-400">連續學習</span>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center backdrop-blur-sm">
           <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Zap size={20} />
            <span className="font-bold text-lg">{Object.values(progress.topicMastery).filter(s => s === 'mastered').length}</span>
          </div>
          <span className="text-xs text-slate-400">精熟觀念</span>
        </div>
      </div>

      {/* Radar Chart & Weakness Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="text-indigo-400" /> 
            能力雷達
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Mastery"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#818cf8' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-lg">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">今日建議</h3>
                <p className="text-slate-300 mb-4">
                    根據你的學習曲線，今天建議加強 <span className="text-rose-400 font-bold">物理</span> 的力學部分與 <span className="text-emerald-400 font-bold">生物</span> 的細胞學。
                </p>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">弱點掃描</h4>
                    <div className="flex flex-wrap gap-2">
                        {progress.recentActivity.length > 0 && progress.recentActivity[0].weakTopics.length > 0 ? (
                            progress.recentActivity[0].weakTopics.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-rose-900/30 text-rose-300 border border-rose-800 rounded text-xs">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-500 text-sm">尚未偵測到明顯弱點，快去練習吧！</span>
                        )}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onChangeView(AppView.MASTERY_MAP)}
                className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2 font-medium"
            >
                查看完整知識地圖 <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* Quick Start Actions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">開始微課程衝刺</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(SUBJECTS) as [Subject, typeof SUBJECTS[Subject]][]).map(([key, val]) => (
                <button
                    key={key}
                    onClick={() => onChangeView(AppView.QUIZ_SETUP, key)}
                    className="group relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 text-left shadow-lg hover:shadow-indigo-500/10"
                >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl grayscale group-hover:grayscale-0`}>
                        {val.icon}
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`w-2 h-8 rounded-full ${val.color}`}></span>
                            <h4 className="text-xl font-bold text-slate-100">{val.label}</h4>
                        </div>
                        <p className="text-slate-400 text-sm pl-5">
                           精熟度: {progress.subjectMastery[key]}%
                        </p>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
