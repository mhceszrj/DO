import React from 'react';
import { Subject, TopicNode } from '../types';
import { TOPICS, SUBJECTS } from '../constants';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';

interface MasteryMapProps {
  masteryData: Record<string, 'locked' | 'learning' | 'mastered'>;
  onSelectTopic: (topic: TopicNode) => void;
  onBack: () => void;
}

const MasteryMap: React.FC<MasteryMapProps> = ({ masteryData, onSelectTopic, onBack }) => {
  // Group topics by subject
  const groupedTopics = TOPICS.reduce((acc, topic) => {
    if (!acc[topic.subject]) acc[topic.subject] = [];
    acc[topic.subject].push(topic);
    return acc;
  }, {} as Record<Subject, TopicNode[]>);

  return (
    <div className="max-w-5xl mx-auto w-full p-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">科學班知識地圖</h2>
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">返回儀表板</button>
      </div>

      <div className="grid gap-8">
        {(Object.keys(SUBJECTS) as Subject[]).map((subject) => {
            const subjectTopics = groupedTopics[subject] || [];
            if (subjectTopics.length === 0) return null;

            return (
                <div key={subject} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${SUBJECTS[subject].color} text-white shadow-lg`}>
                            {SUBJECTS[subject].icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-200">{SUBJECTS[subject].label}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjectTopics.map(topic => {
                            const status = masteryData[topic.id] || 'locked';
                            // For demo purposes, unlock first item of each subject if everything is locked
                            const displayStatus = (status === 'locked' && subjectTopics.indexOf(topic) === 0) ? 'learning' : status;

                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => displayStatus !== 'locked' && onSelectTopic(topic)}
                                    disabled={displayStatus === 'locked'}
                                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2
                                        ${displayStatus === 'locked' 
                                            ? 'bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed' 
                                            : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10'
                                        }
                                        ${displayStatus === 'mastered' ? 'border-emerald-500/50 bg-emerald-900/10' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                            displayStatus === 'locked' ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-indigo-300'
                                        }`}>
                                            {topic.id.split('_')[1].toUpperCase()}
                                        </span>
                                        {displayStatus === 'locked' && <Lock size={14} className="text-slate-600" />}
                                        {displayStatus === 'learning' && <Unlock size={14} className="text-indigo-400" />}
                                        {displayStatus === 'mastered' && <CheckCircle2 size={14} className="text-emerald-400" />}
                                    </div>
                                    
                                    <div>
                                        <h4 className={`font-bold ${displayStatus === 'locked' ? 'text-slate-500' : 'text-slate-200'}`}>
                                            {topic.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {topic.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default MasteryMap;
