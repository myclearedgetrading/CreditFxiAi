
import React, { useState } from 'react';
import { MOCK_CLIENTS } from '../constants';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import { ClientStatus } from '../types';

const Clients: React.FC = () => {
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case ClientStatus.LEAD: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case ClientStatus.PROSPECT: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const handleAddClient = () => {
    alert("New Client Modal would open here.");
  };

  const handleFilter = () => {
    alert("Advanced filters dialog.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Client Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage client profiles and track progress.</p>
        </div>
        <button 
          onClick={handleAddClient}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#0A0A0A] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#111] dark:text-white dark:placeholder-slate-400"
          />
        </div>
        <button 
          onClick={handleFilter}
          className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Client Table */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#111] border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Scores (E/E/T)</th>
                <th className="px-6 py-4">Negative Items</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_CLIENTS.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-[#111] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{client.firstName} {client.lastName}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 text-sm font-medium">
                      <span className="text-slate-600 dark:text-slate-300">{client.creditScore.equifax}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span className="text-slate-600 dark:text-slate-300">{client.creditScore.experian}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span className="text-slate-600 dark:text-slate-300">{client.creditScore.transunion}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-sm font-medium">
                      {client.negativeItems.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                    {client.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
