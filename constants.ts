import { Client, ClientStatus, Bureau, Task, ActivityLog } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    firstName: 'James',
    lastName: 'Robinson',
    email: 'james.r@example.com',
    phone: '(555) 123-4567',
    status: ClientStatus.ACTIVE,
    joinedDate: '2023-10-15',
    creditScore: { equifax: 580, experian: 595, transunion: 582 },
    negativeItems: [
      {
        id: 'n1',
        type: 'Collection',
        creditor: 'Midland Credit Mgmt',
        accountNumber: '****4582',
        amount: 1250,
        dateReported: '2023-05-10',
        bureau: [Bureau.EQUIFAX, Bureau.EXPERIAN],
        status: 'Open'
      },
      {
        id: 'n2',
        type: 'Late Payment',
        creditor: 'Chase Bank',
        accountNumber: '****9921',
        amount: 0,
        dateReported: '2022-11-20',
        bureau: [Bureau.TRANSUNION],
        status: 'Disputed'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.c@example.com',
    phone: '(555) 987-6543',
    status: ClientStatus.ACTIVE,
    joinedDate: '2023-11-02',
    creditScore: { equifax: 620, experian: 610, transunion: 615 },
    negativeItems: [
      {
        id: 'n3',
        type: 'Charge Off',
        creditor: 'Capital One',
        accountNumber: '****1122',
        amount: 2500,
        dateReported: '2023-01-15',
        bureau: [Bureau.EQUIFAX, Bureau.EXPERIAN, Bureau.TRANSUNION],
        status: 'Open'
      }
    ]
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Scott',
    email: 'm.scott@dunder.com',
    phone: '(555) 000-1111',
    status: ClientStatus.LEAD,
    joinedDate: '2023-12-01',
    creditScore: { equifax: 550, experian: 540, transunion: 545 },
    negativeItems: []
  }
];

export const MOCK_STATS = {
  activeClients: 142,
  disputesSent: 856,
  itemsDeleted: 324,
  revenue: 24500
};

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review Round 2 Results',
    clientName: 'Sarah Connor',
    dueDate: 'Today',
    priority: 'HIGH',
    completed: false
  },
  {
    id: 't2',
    title: 'Onboarding Call',
    clientName: 'Michael Scott',
    dueDate: 'Tomorrow',
    priority: 'MEDIUM',
    completed: false
  },
  {
    id: 't3',
    title: 'Upload Identity Docs',
    clientName: 'James Robinson',
    dueDate: 'Overdue',
    priority: 'HIGH',
    completed: false
  },
  {
    id: 't4',
    title: 'Send Monthly Update',
    clientName: 'All Active Clients',
    dueDate: 'In 3 days',
    priority: 'LOW',
    completed: false
  }
];

export const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: 'a1',
    action: 'Dispute Letter Generated',
    description: 'AI generated a Factual Dispute for Equifax',
    timestamp: '10 mins ago',
    type: 'AI'
  },
  {
    id: 'a2',
    action: 'New Lead Captured',
    description: 'Lead form submission from Landing Page A',
    timestamp: '2 hours ago',
    type: 'SYSTEM'
  },
  {
    id: 'a3',
    action: 'Document Uploaded',
    description: 'Sarah Connor uploaded: Utility Bill',
    timestamp: '4 hours ago',
    type: 'USER'
  },
  {
    id: 'a4',
    action: 'Payment Failed',
    description: 'Subscription renewal failed for Client #104',
    timestamp: '5 hours ago',
    type: 'SYSTEM'
  }
];
