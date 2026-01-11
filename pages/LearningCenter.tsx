
import React, { useState } from 'react';
import { 
  BookOpen, PlayCircle, Shield, TrendingUp, Building2, 
  CheckCircle2, Lock, ChevronRight, ArrowLeft, Bot, 
  Send, Sparkles, User, Lightbulb
} from 'lucide-react';
import { generateTutorResponse } from '../services/geminiService';

// --- TYPES ---
type CourseCategory = 'CREDIT_BASICS' | 'ADVANCED_REPAIR' | 'PERSONAL_FUNDING' | 'BUSINESS_FUNDING';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string; // Markdown supported
}

interface Course {
  id: string;
  category: CourseCategory;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: Lesson[];
  progress: number; // 0-100
  isLocked?: boolean;
}

// --- MOCK DATA (Educational Content is static, progress is reset) ---
const COURSES: Course[] = [
  // CREDIT BASICS
  {
    id: 'c1',
    category: 'CREDIT_BASICS',
    title: 'Understanding Your Credit Report',
    description: 'Learn how to read reports from Equifax, Experian, and TransUnion like a pro.',
    level: 'Beginner',
    duration: '15 min',
    progress: 0,
    lessons: [
      { id: 'l1', title: 'The 3 Bureaus Explained', duration: '5 min', content: 'Equifax, Experian, and TransUnion are effectively data aggregators. They do not share data perfectly, which is why your score varies.' },
      { id: 'l2', title: 'Identifying Errors', duration: '10 min', content: 'Look for: misspelled names, old addresses, accounts that arent yours, and incorrect balances.' }
    ]
  },
  {
    id: 'c2',
    category: 'CREDIT_BASICS',
    title: 'The FICO Score Algorithm',
    description: 'Master the 5 factors that make up your score: Payment History, Utilization, etc.',
    level: 'Beginner',
    duration: '20 min',
    progress: 0,
    lessons: [
      { id: 'l1', title: 'Payment History (35%)', duration: '5 min', content: 'The single biggest factor. Even one late payment can drop you 50-100 points.' }
    ]
  },

  // ADVANCED REPAIR
  {
    id: 'c3',
    category: 'ADVANCED_REPAIR',
    title: 'Factual Disputing vs. Metro 2',
    description: 'Why standard "not mine" disputes fail and how to use data compliance attacks.',
    level: 'Advanced',
    duration: '45 min',
    progress: 0,
    lessons: [
      { id: 'l1', title: 'What is Metro 2?', duration: '10 min', content: 'Metro 2 is the standard format used for electronic data reporting. If data is not Metro 2 compliant, it must be deleted.' },
      { id: 'l2', title: 'Attacking the Data Fields', duration: '15 min', content: 'Don\'t just say "not mine". Challenge the "Account Type", "Date of Status", and "High Credit" fields.' }
    ]
  },
  {
    id: 'c4',
    category: 'ADVANCED_REPAIR',
    title: 'CFPB & 609 Letters',
    description: 'Leveraging federal law when bureaus refuse to investigate properly.',
    level: 'Advanced',
    duration: '30 min',
    progress: 0,
    isLocked: true,
    lessons: []
  },

  // PERSONAL FUNDING
  {
    id: 'c5',
    category: 'PERSONAL_FUNDING',
    title: 'Credit Card Stacking',
    description: 'How to apply for multiple cards without tanking your score.',
    level: 'Intermediate',
    duration: '25 min',
    progress: 0,
    lessons: []
  },
  {
    id: 'c6',
    category: 'PERSONAL_FUNDING',
    title: 'Utilization Hacks',
    description: 'The AZEO method (All Zero Except One) to maximize points.',
    level: 'Beginner',
    duration: '10 min',
    progress: 0,
    lessons: []
  },

  // BUSINESS FUNDING
  {
    id: 'c7',
    category: 'BUSINESS_FUNDING',
    title: 'Entity Structuring',
    description: 'Setting up your LLC, EIN, and Foreign Qualification correctly.',
    level: 'Intermediate',
    duration: '40 min',
    progress: 0,
    lessons: []
  },
  {
    id: 'c8',
    category: 'BUSINESS_FUNDING',
    title: 'Tier 1 & Net-30 Vendors',
    description: 'Building your Paydex score with vendors who don\'t check personal credit.',
    level: 'Beginner',
    duration: '20 min',
    progress: 0,
    lessons: []
  },
];

const CATEGORIES: { id: CourseCategory; label: string; icon: any }[] = [
  { id: 'CREDIT_BASICS', label: 'Credit 101', icon: BookOpen },
  { id: 'ADVANCED_REPAIR', label: 'Advanced Strategies', icon: Shield },
  { id: 'PERSONAL_FUNDING', label: 'Personal Funding', icon: User },
  { id: 'BUSINESS_FUNDING', label: 'Business Funding', icon: Building2 },
];

const LearningCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('CREDIT_BASICS');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // AI Tutor State
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'bot', text: string}[]>([
    { sender: 'bot', text: 'Hi! I\'m your AI Tutor. Ask me anything about this lesson.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleStartCourse = (course: Course) => {
    if (course.isLocked) return;
    setSelectedCourse(course);
    if (course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
    }
    // Reset AI chat context
    setChatHistory([{ sender: 'bot', text: `Hi! I'm your AI Tutor for "${course.title}". Ask me anything about this topic.` }]);
  };

  const handleAiSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const context = selectedLesson ? `${selectedCourse?.title}: ${selectedLesson.title}. Content: ${selectedLesson.content}` : "General Credit Repair";
      const response = await generateTutorResponse(context, userMsg);
      setChatHistory(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- RENDER: COURSE PLAYER ---
  if (selectedCourse) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
        {/* Player Header */}
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => { setSelectedCourse(null); setSelectedLesson(null); }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedCourse.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              {selectedLesson?.title || 'Course Overview'}
            </p>
          </div>
          <div className="ml-auto">
             <button 
               onClick={() => setShowAiTutor(!showAiTutor)}
               className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                 showAiTutor ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400'
               }`}
             >
               <Bot className="w-4 h-4 mr-2" />
               {showAiTutor ? 'Close Tutor' : 'Ask AI Tutor'}
             </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar: Lesson List */}
          <div className="w-64 bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-100 dark:border-slate-800 overflow-y-auto hidden md:block">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Course Content</h3>
             </div>
             <div className="p-2 space-y-1">
               {selectedCourse.lessons.map((lesson, idx) => (
                 <button
                   key={lesson.id}
                   onClick={() => setSelectedLesson(lesson)}
                   className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-colors ${
                     selectedLesson?.id === lesson.id 
                       ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                       : 'hover:bg-slate-50 dark:hover:bg-[#111] text-slate-600 dark:text-slate-400'
                   }`}
                 >
                   <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                     selectedLesson?.id === lesson.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-500'
                   }`}>
                     {idx + 1}
                   </div>
                   <div>
                     <div className="font-medium line-clamp-1">{lesson.title}</div>
                     <div className="text-xs opacity-70">{lesson.duration}</div>
                   </div>
                 </button>
               ))}
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative">
             {selectedLesson ? (
               <>
                 {/* Video Placeholder */}
                 <div className="aspect-video bg-slate-900 flex items-center justify-center relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <div className="absolute bottom-4 left-4 text-white">
                       <h3 className="font-bold text-lg">{selectedLesson.title}</h3>
                       <p className="text-sm opacity-80">{selectedCourse.title}</p>
                    </div>
                 </div>
                 
                 {/* Text Content */}
                 <div className="flex-1 overflow-y-auto p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Lesson Notes</h3>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                       <p className="leading-relaxed text-lg">{selectedLesson.content}</p>
                    </div>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                 <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                 <p>Select a lesson to begin.</p>
               </div>
             )}

             {/* AI Tutor Side Panel */}
             {showAiTutor && (
               <div className="absolute top-0 bottom-0 right-0 w-80 bg-white dark:bg-slate-850 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col animate-slide-in-right z-10">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-600 text-white flex justify-between items-center">
                     <div className="flex items-center gap-2 font-bold">
                        <Sparkles className="w-4 h-4" /> AI Tutor
                     </div>
                     <button onClick={() => setShowAiTutor(false)} className="hover:bg-indigo-700 p-1 rounded">
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                     {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                              msg.sender === 'user' 
                                 ? 'bg-indigo-600 text-white rounded-br-none' 
                                 : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
                           }`}>
                              {msg.text}
                           </div>
                        </div>
                     ))}
                     {isTyping && (
                        <div className="flex justify-start">
                           <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-bl-none shadow-sm">
                              <div className="flex gap-1">
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-slate-800">
                     <div className="flex gap-2">
                        <input 
                           className="flex-1 text-sm p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                           placeholder="Ask about this lesson..."
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                        />
                        <button 
                           onClick={handleAiSubmit}
                           className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: CATALOG VIEW ---
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <BookOpen className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Education Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Master credit repair and business funding with our expert-led curriculum.
          </p>
        </div>
        
        {/* Global Progress */}
        <div className="bg-white dark:bg-[#0A0A0A] px-6 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
           <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Total Progress</p>
              <div className="flex items-end gap-1">
                 <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">0%</span>
              </div>
           </div>
           <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-[0%] rounded-full" />
           </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center px-6 py-4 rounded-xl border-2 transition-all min-w-[160px] flex-col gap-2 ${
                activeCategory === cat.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500 text-indigo-800 dark:text-indigo-200 shadow-md' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0A0A] text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-slate-700'
              }`}
            >
              <Icon className={`w-6 h-6 ${activeCategory === cat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span className="font-bold text-sm">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.filter(c => c.category === activeCategory).map(course => (
          <div 
            key={course.id}
            className={`bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all hover:shadow-md ${
              course.isLocked 
                ? 'border-slate-200 dark:border-slate-800 opacity-70 grayscale-[0.5]' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500'
            }`}
          >
            {/* Thumbnail Placeholder */}
            <div className="h-40 bg-slate-100 dark:bg-[#111] relative flex items-center justify-center">
               <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/80 dark:bg-black/50 backdrop-blur-sm ${
                     course.level === 'Beginner' ? 'text-green-600' : course.level === 'Intermediate' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                     {course.level}
                  </span>
               </div>
               {course.isLocked ? (
                 <Lock className="w-10 h-10 text-slate-400" />
               ) : (
                 <PlayCircle className="w-12 h-12 text-indigo-600 dark:text-indigo-400 opacity-80" />
               )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
               <div className="mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
               </div>

               <div className="mt-auto">
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                     <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {course.lessons.length} Lessons</span>
                     <span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {course.duration}</span>
                  </div>
                  
                  {/* Course Progress */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>

                  <button 
                    onClick={() => handleStartCourse(course)}
                    disabled={!!course.isLocked}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${
                       course.isLocked 
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed' 
                          : course.progress > 0
                             ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:bg-[#111] dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
                             : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                     {course.isLocked ? 'Locked' : course.progress > 0 ? 'Continue' : 'Start Course'}
                     {!course.isLocked && <ChevronRight className="w-4 h-4 ml-1" />}
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {COURSES.filter(c => c.category === activeCategory).length === 0 && (
         <div className="text-center py-20 text-slate-400">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>New courses for this category are coming soon.</p>
         </div>
      )}
    </div>
  );
};

export default LearningCenter;
