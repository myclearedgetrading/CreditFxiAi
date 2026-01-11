
import React, { useState } from 'react';
import { 
  Trophy, Medal, Star, Flame, Target, Share2, 
  Award, Lock, Unlock, PlayCircle, CheckCircle2, 
  HelpCircle, ChevronRight, Copy, Zap, UserPlus, Gift
} from 'lucide-react';
import { GamificationProfile, Achievement, Quest, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

const INITIAL_PROFILE: GamificationProfile = {
  level: 1,
  currentPoints: 0,
  pointsToNextLevel: 1000,
  tier: 'BRONZE',
  streakDays: 0,
  referralCode: 'USER-2024',
  totalReferrals: 0
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Win', description: 'Get your first negative item deleted', icon: 'Trophy', unlocked: false, progress: 0, pointsReward: 500 },
  { id: '2', title: 'Triple Threat', description: 'Remove items from all 3 bureaus', icon: 'Zap', unlocked: false, progress: 0, pointsReward: 1000 },
  { id: '3', title: 'Century Club', description: 'Improve credit score by 100 points', icon: 'Star', unlocked: false, progress: 0, pointsReward: 2000 },
  { id: '4', title: 'Debt Destroyer', description: 'Pay off $5,000 in collections', icon: 'Flame', unlocked: false, progress: 0, pointsReward: 1500 },
];

const INITIAL_QUESTS: Quest[] = [
  { id: '1', title: 'Credit Basics Mastery', description: 'Learn the fundamentals of FICO scores', category: 'BASICS', totalSteps: 5, completedSteps: 0, rewardPoints: 250, status: 'ACTIVE' },
  { id: '2', title: 'Dispute Process 101', description: 'Understand how disputes work', category: 'BASICS', totalSteps: 3, completedSteps: 0, rewardPoints: 150, status: 'LOCKED' },
];

const GamificationCenter: React.FC = () => {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'referrals'>('overview');
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);

  const startQuest = async (questTitle: string) => {
    setQuizLoading(true);
    setShowQuiz(true);
    setQuizResult(null);
    setSelectedOption(null);
    try {
      const quiz = await generateQuiz(questTitle);
      setCurrentQuiz(quiz);
    } catch (e) {
      console.error(e);
      setShowQuiz(false); // Close on error
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (quizResult !== null) return; // Prevent multiple clicks
    setSelectedOption(index);
    if (currentQuiz && index === currentQuiz.correctIndex) {
      setQuizResult('correct');
      setProfile(prev => ({ ...prev, currentPoints: prev.currentPoints + 50 }));
    } else {
      setQuizResult('incorrect');
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(profile.referralCode);
    alert("Referral code copied!");
  };

  const progressPercentage = (profile.currentPoints / profile.pointsToNextLevel) * 100;

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          
          {/* Level Circle */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-indigo-950" />
                <circle 
                  cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" 
                  className="text-yellow-400" 
                  strokeDasharray={`${progressPercentage * 2.76} 276`}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="text-center">
                <span className="text-xs uppercase opacity-70">Level</span>
                <div className="text-3xl font-bold">{profile.level}</div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold">My Rewards</h2>
              <div className="flex items-center gap-2 mt-1">
                <Medal className="w-5 h-5 text-yellow-400" />
                <span className="font-bold tracking-wide">{profile.tier} MEMBER</span>
              </div>
              <p className="text-sm opacity-70 mt-1">{profile.pointsToNextLevel - profile.currentPoints} points to next level</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
             <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center min-w-[100px] backdrop-blur-sm">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold">{profile.currentPoints}</div>
                <div className="text-xs opacity-70">Total Points</div>
             </div>
             <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center min-w-[100px] backdrop-blur-sm">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1 animate-pulse" />
                <div className="text-xl font-bold">{profile.streakDays}</div>
                <div className="text-xs opacity-70">Day Streak</div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Award className="w-4 h-4 mr-2" /> Overview & Badges
        </button>
        <button 
          onClick={() => setActiveTab('quests')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'quests' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Target className="w-4 h-4 mr-2" /> Quests & Learning
        </button>
      </div>

      {/* OVERVIEW CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((badge) => (
                <div key={badge.id} className={`p-4 rounded-xl border-2 transition-all ${
                  badge.unlocked 
                    ? 'border-indigo-100 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800' 
                    : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-[#111] grayscale opacity-70'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${badge.unlocked ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {badge.icon === 'Trophy' ? <Trophy className="w-6 h-6" /> : 
                       badge.icon === 'Star' ? <Star className="w-6 h-6" /> : 
                       badge.icon === 'Flame' ? <Flame className="w-6 h-6" /> : 
                       <Zap className="w-6 h-6" />}
                    </div>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{badge.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 h-8">{badge.description}</p>
                  
                  {!badge.unlocked && (
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${badge.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUESTS CONTENT */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          {INITIAL_QUESTS.map((quest) => (
            <div key={quest.id} className="bg-white dark:bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all group">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          quest.category === 'BASICS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                       }`}>
                          {quest.category}
                       </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{quest.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{quest.description}</p>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                       <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{quest.completedSteps} / {quest.totalSteps} Steps</div>
                       <div className="text-xs text-slate-400">{quest.rewardPoints} pts reward</div>
                    </div>
                    <button 
                      onClick={() => quest.status !== 'LOCKED' && quest.status !== 'COMPLETED' && startQuest(quest.title)}
                      disabled={quest.status === 'LOCKED' || quest.status === 'COMPLETED'}
                      className={`p-3 rounded-full transition-colors ${
                         quest.status === 'ACTIVE' 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-105 transform' 
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                       {quest.status === 'LOCKED' ? <Lock className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in transition-colors">
              {quizLoading ? (
                 <div className="p-10 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Generating Challenge...</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Our AI is crafting a unique question for you.</p>
                 </div>
              ) : currentQuiz ? (
                 <>
                   <div className="bg-indigo-600 p-6 text-white">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold uppercase bg-white bg-opacity-20 px-2 py-1 rounded">Quick Quiz</span>
                         <span className="text-xs font-bold">+50 PTS</span>
                      </div>
                      <h3 className="text-lg font-bold leading-tight">{currentQuiz.question}</h3>
                   </div>
                   
                   <div className="p-6 space-y-3">
                      {currentQuiz.options.map((option, idx) => (
                         <button
                           key={idx}
                           onClick={() => handleAnswer(idx)}
                           disabled={quizResult !== null}
                           className={`w-full p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center ${
                              selectedOption === idx 
                                ? quizResult === 'correct' 
                                   ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                   : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : quizResult !== null && idx === currentQuiz.correctIndex
                                   ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                   : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200'
                           }`}
                         >
                            <span className="font-medium">{option}</span>
                            {selectedOption === idx && (
                               quizResult === 'correct' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-red-500" />
                            )}
                         </button>
                      ))}

                      {quizResult && (
                         <button 
                            onClick={() => setShowQuiz(false)}
                            className="w-full mt-4 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                         >
                            Close Challenge
                         </button>
                      )}
                   </div>
                 </>
              ) : (
                 <div className="p-8 text-center">
                    <p className="text-red-500 mb-4">Failed to load quiz.</p>
                    <button onClick={() => setShowQuiz(false)} className="text-indigo-600 underline">Close</button>
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};

export default GamificationCenter;
