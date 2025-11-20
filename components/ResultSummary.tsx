import React, { useEffect, useState } from 'react';
import { Question, Subject } from '../types';
import { analyzeWeaknesses } from '../services/geminiService';
import { Trophy, RefreshCcw, Home, Star } from 'lucide-react';

interface ResultSummaryProps {
  result: {
    correctCount: number;
    total: number;
    failedQuestions: Question[];
  };
  subject: Subject;
  onHome: () => void;
  onRetry: () => void;
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ result, subject, onHome, onRetry }) => {
  const [analysis, setAnalysis] = useState<string>('AI 正在分析您的答題弱點...');
  
  const percentage = Math.round((result.correctCount / result.total) * 100);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (result.failedQuestions.length > 0) {
        const text = await analyzeWeaknesses(result.failedQuestions);
        setAnalysis(text);
      } else {
        setAnalysis("太強了！全對！建議挑戰更高難度的單元，或嘗試其他科目的進階題型。");
      }
    };
    fetchAnalysis();
  }, [result.failedQuestions]);

  return (
    <div className="max-w-2xl mx-auto w-full p-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
        <div className="relative bg-slate-800 p-8 rounded-full border-4 border-indigo-500/30 shadow-2xl flex flex-col items-center justify-center w-48 h-48">
          <span className="text-5xl font-black text-white mb-1">{percentage}%</span>
          <span className="text-slate-400 text-sm">正確率</span>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-amber-400 shadow-lg whitespace-nowrap">
          <Trophy size={16} fill="currentColor" />
          <span className="font-bold text-sm">獲得 {result.correctCount * 50} XP</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">測驗完成！</h2>
      <p className="text-slate-400 mb-8">你已經向科學班邁進了一步</p>

      <div className="w-full bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
            <Star size={18} />
            AI 導師分析
        </h3>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {analysis}
        </div>
      </div>

      <div className="flex w-full gap-4">
        <button 
          onClick={onHome}
          className="flex-1 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} />
          回首頁
        </button>
        <button 
          onClick={onRetry}
          className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <RefreshCcw size={18} />
          再練一次
        </button>
      </div>

    </div>
  );
};

export default ResultSummary;
