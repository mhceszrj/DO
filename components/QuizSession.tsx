import React, { useState, useEffect } from 'react';
import { Question, Subject } from '../types';
import { SUBJECTS } from '../constants';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { generateQuestions } from '../services/geminiService';

interface QuizSessionProps {
  subject: Subject;
  topics: string[];
  onComplete: (results: { correctCount: number; total: number; failedQuestions: Question[] }) => void;
  onExit: () => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({ subject, topics, onComplete, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const qs = await generateQuestions(subject, topics, 3); // Micro-session: 3 questions
        setQuestions(qs);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("無法產生題目，請檢查網路或稍後再試");
        setLoading(false);
      }
    };
    loadQuestions();
  }, [subject, topics]);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    if (index === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    } else {
      setFailedQuestions(prev => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete({ correctCount: score + (questions[currentIndex].correctIndex === selectedOption ? 1 : 0), total: questions.length, failedQuestions });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-lg animate-pulse">AI 導師正在為你編寫科學班難題...</p>
        <p className="text-sm text-slate-500">分析主題: {topics.join(', ') || '綜合測驗'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-rose-400 space-y-4">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={onExit} className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white">返回</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${SUBJECTS[subject].color}`}></span>
            <span className="text-slate-400 text-sm font-medium tracking-wider uppercase">
                {SUBJECTS[subject].label} • Q{currentIndex + 1}/{questions.length}
            </span>
        </div>
        <button onClick={onExit} className="text-slate-500 hover:text-slate-300 text-sm">
            退出
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1 rounded-full mb-8 overflow-hidden">
        <div 
            className="bg-indigo-500 h-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
            <div className="mb-2">
                 <span className="inline-block px-2 py-1 rounded bg-slate-800 text-xs text-indigo-300 border border-indigo-500/30 mb-4">
                    {currentQ.topicTag}
                 </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-100 leading-relaxed mb-8">
                {currentQ.text}
            </h2>

            <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                    let stateClass = "border-slate-700 bg-slate-800/50 hover:bg-slate-800"; // default
                    if (isAnswered) {
                        if (idx === currentQ.correctIndex) {
                            stateClass = "border-emerald-500 bg-emerald-500/10 text-emerald-200";
                        } else if (idx === selectedOption) {
                            stateClass = "border-rose-500 bg-rose-500/10 text-rose-200";
                        } else {
                            stateClass = "border-slate-800 opacity-50";
                        }
                    } else if (selectedOption === idx) {
                        stateClass = "border-indigo-500 bg-indigo-500/20";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${stateClass}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isAnswered && idx === currentQ.correctIndex ? 'bg-emerald-500 text-white' :
                                    isAnswered && idx === selectedOption ? 'bg-rose-500 text-white' :
                                    'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                                }`}>
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="font-medium">{opt}</span>
                            </div>
                            {isAnswered && idx === currentQ.correctIndex && <CheckCircle className="text-emerald-500" size={20}/>}
                            {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle className="text-rose-500" size={20}/>}
                        </button>
                    )
                })}
            </div>

            {/* Explanation Section */}
            {isAnswered && (
                <div className={`mt-8 p-5 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    selectedOption === currentQ.correctIndex ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                             {selectedOption === currentQ.correctIndex ? 
                                <CheckCircle className="text-emerald-400" size={24} /> : 
                                <AlertCircle className="text-rose-400" size={24} />
                            }
                        </div>
                        <div>
                            <h4 className={`font-bold mb-2 ${
                                selectedOption === currentQ.correctIndex ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {selectedOption === currentQ.correctIndex ? '答對了！' : '觀念解析'}
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                {currentQ.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-6 flex justify-end">
        <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg ${
                isAnswered 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white translate-y-0' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
        >
            {currentIndex === questions.length - 1 ? '完成測驗' : '下一題'}
            <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default QuizSession;
