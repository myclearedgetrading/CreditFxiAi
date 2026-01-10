import React, { useState } from 'react';
import { 
  LifeBuoy, Ticket, Heart, MessageSquare, Plus, Search, 
  Filter, CheckCircle2, Clock, AlertCircle, BarChart3, 
  Send, User, Video, Mic, Sparkles, Smile, Frown, Meh
} from 'lucide-react';
import { analyzeSupportTicket } from '../services/geminiService';
import { SupportTicket, ClientHealthMetric, TicketStatus, TicketPriority } from '../types';

// Mock Data
const MOCK_TICKETS: SupportTicket[] = [
  { id: 'T-101', clientId: 'c1', clientName: 'James Robinson', subject: 'Billing Issue - Double Charge', priority: 'HIGH', status: 'OPEN', category: 'BILLING', createdAt: '2h ago', updatedAt: '1h ago', channel: 'EMAIL', sentiment: 'NEGATIVE', tags: ['refund', 'urgent'] },
  { id: 'T-102', clientId: 'c2', clientName: 'Sarah Connor', subject: 'Dispute Status Update?', priority: 'LOW', status: 'PENDING', category: 'DISPUTE_UPDATE', createdAt: '5h ago', updatedAt: '2h ago', channel: 'PORTAL', sentiment: 'NEUTRAL', tags: ['status_check'] },
  { id: 'T-103', clientId: 'c3', clientName: 'Michael Scott', subject: 'Login not working', priority: 'MEDIUM', status: 'RESOLVED', category: 'TECHNICAL', createdAt: '1d ago', updatedAt: '1d ago', channel: 'CHAT', sentiment: 'NEGATIVE', tags: ['password_reset'] },
];

const MOCK_HEALTH: ClientHealthMetric[] = [
  { clientId: 'c1', clientName: 'James Robinson', overallScore: 85, engagementScore: 90, paymentHealth: 100, disputeSuccess: 65, trend: 'STABLE', lastContact: 'Today', nextScheduledTouchpoint: 'Nov 25', riskFactors: [] },
  { clientId: 'c2', clientName: 'Sarah Connor', overallScore: 42, engagementScore: 30, paymentHealth: 80, disputeSuccess: 15, trend: 'DECLINING', lastContact: '14 days ago', nextScheduledTouchpoint: 'Nov 22', riskFactors: ['Low Engagement', 'Poor Results'] },
  { clientId: 'c3', clientName: 'Michael Scott', overallScore: 68, engagementScore: 70, paymentHealth: 50, disputeSuccess: 85, trend: 'IMPROVING', lastContact: 'Yesterday', nextScheduledTouchpoint: 'Nov 30', riskFactors: ['Late Payment'] },
];

const SupportCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'health' | 'chat'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  
  // Ticket Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Chat
  const [chatMessage, setChatMessage] = useState('');
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);

  const handleCreateTicket = async () => {
    if (!newSubject || !newMessage) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSupportTicket(newSubject, newMessage);
      const newTicket: SupportTicket = {
        id: `T-${Date.now()}`,
        clientId: 'unknown',
        clientName: 'New Client', // In real app, select client
        subject: newSubject,
        priority: analysis.priority,
        status: 'OPEN',
        category: analysis.category,
        createdAt: 'Just now',
        updatedAt: 'Just now',
        channel: 'EMAIL', // simulated
        sentiment: analysis.sentiment,
        tags: analysis.tags
      };
      setTickets([newTicket, ...tickets]);
      setShowCreateModal(false);
      setNewSubject('');
      setNewMessage('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (p: TicketPriority) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <LifeBuoy className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Support & Success
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage tickets, monitor client health, and provide real-time support.
          </p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'tickets' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Ticket className="w-4 h-4 mr-2" /> Ticket Queue
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'health' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <Heart className="w-4 h-4 mr-2" /> Client Health
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Live Support
        </button>
      </div>

      {/* TICKET SYSTEM */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Sidebar Filters */}
           <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
              <div className="mb-6">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Views</h3>
                 <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">All Open Tickets</button>
                    <button className="w-full text-left px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm">Assigned to Me</button>
                    <button className="w-full text-left px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm">Recently Solved</button>
                 </div>
              </div>
              
              <div>
                 <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">By Priority</h3>
                 <div className="space-y-2">
                    {['Critical', 'High', 'Medium', 'Low'].map(p => (
                       <label key={p} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                          {p}
                       </label>
                    ))}
                 </div>
              </div>
           </div>

           {/* Ticket List */}
           <div className="lg:col-span-3 space-y-4">
              {tickets.map((ticket) => (
                 <div key={ticket.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                             {ticket.priority}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          {ticket.sentiment === 'NEGATIVE' && <Frown className="w-4 h-4 text-red-400" />}
                          {ticket.sentiment === 'POSITIVE' && <Smile className="w-4 h-4 text-green-400" />}
                          <span className="text-xs text-slate-400">{ticket.createdAt}</span>
                       </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                       {ticket.subject}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                             {ticket.clientName.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{ticket.clientName}</span>
                       </div>
                       <div className="flex gap-2">
                          {ticket.tags.map(tag => (
                             <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                                {tag}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* HEALTH MONITOR */}
      {activeTab === 'health' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-700 dark:text-slate-200">Overall Health</h3>
                     <Heart className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">88%</div>
                  <p className="text-xs text-green-600 dark:text-green-400">+2% vs last week</p>
               </div>
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-700 dark:text-slate-200">At Risk Clients</h3>
                     <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">12</div>
                  <p className="text-xs text-red-600 dark:text-red-400">Requires attention</p>
               </div>
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-700 dark:text-slate-200">NPS Score</h3>
                     <Smile className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">64</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Great range</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold">
                     <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Health Score</th>
                        <th className="px-6 py-4">Trend</th>
                        <th className="px-6 py-4">Risk Factors</th>
                        <th className="px-6 py-4">Next Touchpoint</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                     {MOCK_HEALTH.map((client) => (
                        <tr key={client.clientId} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                           <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{client.clientName}</td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full ${client.overallScore > 70 ? 'bg-green-500' : client.overallScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                       style={{ width: `${client.overallScore}%` }} 
                                    />
                                 </div>
                                 <span className={`font-bold ${getHealthColor(client.overallScore)}`}>{client.overallScore}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              {client.trend === 'IMPROVING' ? <span className="text-green-600 dark:text-green-400 font-bold text-xs">↗ Improving</span> :
                               client.trend === 'DECLINING' ? <span className="text-red-600 dark:text-red-400 font-bold text-xs">↘ Declining</span> :
                               <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">→ Stable</span>}
                           </td>
                           <td className="px-6 py-4">
                              {client.riskFactors.length > 0 ? (
                                 <div className="flex flex-wrap gap-1">
                                    {client.riskFactors.map(r => (
                                       <span key={r} className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">{r}</span>
                                    ))}
                                 </div>
                              ) : (
                                 <span className="text-slate-400 text-xs">-</span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{client.nextScheduledTouchpoint}</td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs">View Plan</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* LIVE CHAT */}
      {activeTab === 'chat' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <h3 className="font-bold text-slate-800 dark:text-white">Active Conversations</h3>
               </div>
               <div className="flex-1 overflow-y-auto">
                  {['Sarah Connor', 'Michael Scott', 'Unknown Visitor'].map((name, i) => (
                     <div 
                        key={i} 
                        onClick={() => setActiveChat({ id: `${i}`, name })}
                        className={`p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${activeChat?.name === name ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                     >
                        <div className="flex justify-between items-start mb-1">
                           <span className="font-bold text-slate-800 dark:text-white text-sm">{name}</span>
                           <span className="text-[10px] text-slate-400">2m ago</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">I have a question about my latest dispute result...</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
               {activeChat ? (
                  <>
                     <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-750">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-800 dark:text-white">{activeChat.name}</h3>
                              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" /> Online
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"><Video className="w-4 h-4" /></button>
                           <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"><Mic className="w-4 h-4" /></button>
                        </div>
                     </div>
                     
                     <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-6 overflow-y-auto space-y-4">
                        <div className="flex justify-start">
                           <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none shadow-sm max-w-[80%] text-sm text-slate-700 dark:text-slate-300">
                              Hi, I see that my TransUnion dispute is still pending. Any updates?
                           </div>
                        </div>
                        <div className="flex justify-end">
                           <div className="bg-indigo-600 text-white p-3 rounded-xl rounded-tr-none shadow-sm max-w-[80%] text-sm">
                              Hello! Let me check that for you right now.
                           </div>
                        </div>
                     </div>

                     <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-700 dark:text-white"
                              placeholder="Type your reply..."
                              value={chatMessage}
                              onChange={e => setChatMessage(e.target.value)}
                           />
                           <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                              <Send className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                     <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                     <p>Select a chat to start messaging</p>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* Ticket Modal */}
      {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create Support Ticket</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                     <input 
                        type="text" 
                        className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief summary of the issue"
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                     <textarea 
                        className="w-full border border-slate-200 dark:border-slate-600 rounded-lg p-2 h-32 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Detailed description..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                     />
                  </div>
                  {isAnalyzing && (
                     <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm">
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        AI is categorizing and prioritizing...
                     </div>
                  )}
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-750 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleCreateTicket} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Create Ticket</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default SupportCenter;