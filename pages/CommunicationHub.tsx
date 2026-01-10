import React, { useState } from 'react';
import { 
  MessageCircle, Mail, MessageSquare, Calendar as CalendarIcon, 
  GraduationCap, Star, Send, Plus, Video, Search, User, Check, Bot
} from 'lucide-react';
import { generateChatResponse, generateEducationalContent } from '../services/geminiService';
import { ChatMessage, EmailCampaign, SMSConversation, Appointment, EducationArticle } from '../types';

// Mock Data
const MOCK_CAMPAIGNS: EmailCampaign[] = [
  { id: '1', name: 'New Client Onboarding', status: 'Active', audience: 'Leads', openRate: 45, clickRate: 12, nextScheduled: 'Tomorrow' },
  { id: '2', name: 'Credit Education Series', status: 'Active', audience: 'All Clients', openRate: 38, clickRate: 8, nextScheduled: 'Mon, 9 AM' },
  { id: '3', name: 'Win-Back Inactive', status: 'Draft', audience: 'Inactive > 30 days', openRate: 0, clickRate: 0, nextScheduled: null },
];

const MOCK_SMS: SMSConversation[] = [
  { id: '1', clientId: '101', clientName: 'James Robinson', lastMessage: 'Thanks for the update!', timestamp: '10:30 AM', unread: true },
  { id: '2', clientId: '102', clientName: 'Sarah Connor', lastMessage: 'When is my next bill due?', timestamp: 'Yesterday', unread: false },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', clientId: '101', clientName: 'James Robinson', type: 'Onboarding', startTime: '2023-11-20T10:00:00', status: 'Confirmed' },
  { id: '2', clientId: '103', clientName: 'Michael Scott', type: 'Strategy Call', startTime: '2023-11-20T14:30:00', status: 'Pending' },
];

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
        category: 'Credit Basics',
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
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <MessageCircle className="text-indigo-600 w-8 h-8" />
          Intelligent Communication Hub
        </h1>
        <p className="text-slate-500 mt-1">
          Unified platform for AI chat, campaigns, SMS, and client education.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto flex-shrink-0">
        {[
          { id: 'chatbot', label: 'AI Chatbot Simulator', icon: Bot },
          { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
          { id: 'sms', label: 'SMS Console', icon: MessageSquare },
          { id: 'calendar', label: 'Appointments', icon: CalendarIcon },
          { id: 'education', label: 'Education Hub', icon: GraduationCap },
          { id: 'reviews', label: 'Reviews', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
            <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
                <span className="font-bold text-indigo-900 flex items-center">
                  <Bot className="w-5 h-5 mr-2" /> Client Portal Chat Simulator
                </span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">Online</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 italic">
                      AI is thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Type a message as a client..."
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

            <div className="hidden lg:block w-1/3 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">Bot Capabilities</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Answer FAQs</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Check Dispute Status</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Booking Appointments</li>
                  <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Multilingual Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> New Campaign
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Audience</th>
                    <th className="p-4">Open Rate</th>
                    <th className="p-4">Click Rate</th>
                    <th className="p-4">Next Scheduled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_CAMPAIGNS.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{camp.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          camp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{camp.audience}</td>
                      <td className="p-4">{camp.openRate}%</td>
                      <td className="p-4">{camp.clickRate}%</td>
                      <td className="p-4 text-slate-500">{camp.nextScheduled || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SMS CONSOLE */}
        {activeTab === 'sms' && (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {MOCK_SMS.map((sms) => (
                  <div key={sms.id} className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${sms.unread ? 'bg-indigo-50' : ''}`}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{sms.clientName}</span>
                      <span className="text-xs text-slate-400">{sms.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{sms.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a conversation to view details</p>
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_APPOINTMENTS.map((appt) => (
              <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                     <Video className="w-5 h-5" />
                   </div>
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                     appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {appt.status}
                   </span>
                 </div>
                 <h4 className="font-bold text-slate-800">{appt.type}</h4>
                 <p className="text-sm text-slate-500 mb-4">with {appt.clientName}</p>
                 <div className="text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded">
                   {new Date(appt.startTime).toLocaleString()}
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION HUB */}
        {activeTab === 'education' && (
           <div className="h-full flex flex-col">
             <div className="flex gap-4 mb-6">
               <input 
                 type="text" 
                 placeholder="Enter topic for AI Article (e.g., 'How to improve credit utilization')"
                 className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
               {/* Mock Article */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-3 inline-block">Credit Basics</span>
                 <h3 className="font-bold text-slate-800 mb-2">Understanding Your FICO Score</h3>
                 <p className="text-sm text-slate-600 line-clamp-4">
                   Your FICO score is calculated based on five key factors: payment history, amounts owed, length of credit history, new credit, and credit mix. Improving these areas...
                 </p>
                 <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                   <span>AI Generated</span>
                   <button className="text-indigo-600 hover:underline">Edit</button>
                 </div>
               </div>

               {articles.map((article) => (
                 <div key={article.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fade-in">
                   <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded mb-3 inline-block">{article.category}</span>
                   <h3 className="font-bold text-slate-800 mb-2">{article.title}</h3>
                   <div className="text-sm text-slate-600 line-clamp-4 prose prose-sm">
                     {article.content}
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                     <span>Just now</span>
                     <button className="text-indigo-600 hover:underline">Edit</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
            <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Review Automation</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Configure automated review requests to be sent after key milestones (e.g., first deletion, score increase).
            </p>
            <button className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
              Configure Triggers
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunicationHub;