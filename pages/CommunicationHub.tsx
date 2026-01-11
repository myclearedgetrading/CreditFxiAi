
import React, { useState } from 'react';
import { 
  MessageCircle, Mail, MessageSquare, Calendar as CalendarIcon, 
  GraduationCap, Star, Send, Plus, Video, Search, User, Check, Bot
} from 'lucide-react';
import { generateChatResponse, generateEducationalContent } from '../services/geminiService';
import { ChatMessage, EducationArticle } from '../types';

const CommunicationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chatbot');

  // Chatbot State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '0', sender: 'bot', text: 'Hello! I am the CreditFix AI Assistant. How can I help you today?', timestamp: new Date().toISOString() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Education State
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(chatHistory, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!topicInput.trim()) return;
    setIsGeneratingArticle(true);
    try {
      const content = await generateEducationalContent(topicInput);
      const newArticle: EducationArticle = {
        id: Date.now().toString(),
        title: topicInput,
        category: 'Custom Guide',
        content: content,
        isAiGenerated: true
      };
      setArticles([newArticle, ...articles]);
      setTopicInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <MessageCircle className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
          Intelligent Communication Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Unified platform for AI chat and client education.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto flex-shrink-0">
        {[
          { id: 'chatbot', label: 'AI Chatbot Simulator', icon: Bot },
          { id: 'education', label: 'Education Hub', icon: GraduationCap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* CHATBOT SIMULATOR */}
        {activeTab === 'chatbot' && (
          <div className="h-full flex gap-6">
            <div className="w-full lg:w-2/3 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-colors">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-900/20 flex justify-between items-center">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center">
                  <Bot className="w-5 h-5 mr-2" /> Client Portal Chat Simulator
                </span>
                <span className="text-xs bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-bold">Online</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 dark:bg-[#151515] text-slate-800 dark:text-white rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-[#151515] rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 italic">
                      AI is thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-[#111] dark:text-white"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDUCATION HUB */}
        {activeTab === 'education' && (
           <div className="h-full flex flex-col">
             <div className="flex gap-4 mb-6">
               <input 
                 type="text" 
                 placeholder="Enter topic for AI Article (e.g., 'How to improve credit utilization')"
                 className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-[#0A0A0A] dark:text-white"
                 value={topicInput}
                 onChange={(e) => setTopicInput(e.target.value)}
               />
               <button 
                 onClick={handleGenerateArticle}
                 disabled={isGeneratingArticle}
                 className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
               >
                 {isGeneratingArticle ? 'Writing...' : 'Generate AI Content'}
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
               {articles.length === 0 ? (
                   <div className="col-span-full text-center py-20 text-slate-400">
                       <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                       <p>Ask the AI to generate a custom guide for you above.</p>
                   </div>
               ) : (
                   articles.map((article) => (
                    <div key={article.id} className="bg-white dark:bg-[#0A0A0A] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded mb-3 inline-block">{article.category}</span>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-2">{article.title}</h3>
                      <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 prose prose-sm dark:prose-invert">
                        {article.content}
                      </div>
                    </div>
                  ))
               )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationHub;
