
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, Ticket, Heart, MessageSquare, Plus, 
  Loader2, Sparkles
} from 'lucide-react';
import { analyzeSupportTicket } from '../services/geminiService';
import { subscribeToTickets, createTicket, tenantCompanyId } from '../services/firebaseService';
import { SupportTicket, TicketPriority } from '../types';
import { useUser } from '../context/UserContext';

const SupportCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'health' | 'chat'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const role = user.role;
  
  // Ticket Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const companyId = tenantCompanyId(user);

  useEffect(() => {
    if (!companyId) {
      setTickets([]);
      setIsLoading(false);
      return;
    }
    const unsubscribe = subscribeToTickets(companyId, (realTickets) => {
      setTickets(realTickets);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [companyId]);

  const handleCreateTicket = async () => {
    if (!newSubject || !newMessage || !companyId) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSupportTicket(newSubject, newMessage);
      await createTicket(companyId, {
        clientId: user.id,
        clientName: `${user.firstName} ${user.lastName}`, 
        subject: newSubject,
        priority: analysis.priority,
        category: analysis.category,
        channel: 'PORTAL', 
        sentiment: analysis.sentiment,
        tags: analysis.tags
      });
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

  // Filter tickets for client view
  const displayTickets = role === 'USER' 
    ? tickets.filter(t => t.clientId === user.id) 
    : tickets;

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
            {role === 'ADMIN' ? 'Manage tickets, monitor client health, and provide real-time support.' : 'How can we help you today?'}
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
          <Ticket className="w-4 h-4 mr-2" /> {role === 'ADMIN' ? 'Ticket Queue' : 'My Tickets'}
        </button>
      </div>

      {/* TICKET SYSTEM */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Sidebar Filters */}
           <div className="lg:col-span-1 bg-white dark:bg-[#0A0A0A] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
              <div className="mb-6">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Views</h3>
                 <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                      {role === 'ADMIN' ? 'All Open Tickets' : 'Active Tickets'}
                    </button>
                    <button className="w-full text-left px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm">
                      {role === 'ADMIN' ? 'Assigned to Me' : 'Closed Tickets'}
                    </button>
                 </div>
              </div>
           </div>

           {/* Ticket List */}
           <div className="lg:col-span-3 space-y-4">
              {isLoading ? (
                  <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
              ) : displayTickets.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No tickets found.</div>
              ) : displayTickets.map((ticket) => (
                 <div key={ticket.id} className="bg-white dark:bg-[#0A0A0A] p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                             {ticket.priority}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{ticket.createdAt}</span>
                       </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                       {ticket.subject}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                             {ticket.clientName ? ticket.clientName.charAt(0) : 'U'}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{ticket.clientName}</span>
                       </div>
                       <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {ticket.status}
                          </span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create Support Ticket</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                     <input 
                        type="text" 
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief summary of the issue"
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                     <textarea 
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 h-32 bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
               <div className="p-6 bg-slate-50 dark:bg-[#111] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleCreateTicket} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Create Ticket</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default SupportCenter;
