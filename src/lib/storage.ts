import type { User, Message, Donation, Report, ExternalReport, FundRequest, Distribution } from './constants';

// Storage keys
const KEYS = {
  USERS: 'alkhidmat_users',
  MESSAGES: 'alkhidmat_messages',
  DONATIONS: 'alkhidmat_donations',
  REPORTS: 'alkhidmat_reports',
  EXTERNAL_REPORTS: 'alkhidmat_external_reports',
  FUND_REQUESTS: 'alkhidmat_fund_requests',
  DISTRIBUTIONS: 'alkhidmat_distributions',
  SESSION: 'alkhidmat_session',
  INITIALIZED: 'alkhidmat_initialized',
};

// Generate unique ID
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Generate transaction ID
export const generateTransactionId = () => 
  `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Initialize default data
export const initializeStorage = () => {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  const defaultUsers: User[] = [
    { id: generateId(), email: 'officer@alkhidmat.org', password: 'password123', role: 'Finance Officer' },
    { id: generateId(), email: 'admin@alkhidmat.org', password: 'password123', role: 'Finance Administrator' },
    { id: generateId(), email: 'manager@alkhidmat.org', password: 'password123', role: 'Program Manager' },
  ];

  localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
  localStorage.setItem(KEYS.DONATIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.REPORTS, JSON.stringify([]));
  localStorage.setItem(KEYS.EXTERNAL_REPORTS, JSON.stringify([]));
  localStorage.setItem(KEYS.FUND_REQUESTS, JSON.stringify([]));
  localStorage.setItem(KEYS.DISTRIBUTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.INITIALIZED, 'true');
};

// Generic storage helpers
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]): void => {
  localStorage.setItem(key, JSON.stringify(items));
};

// User operations
export const getUsers = (): User[] => getItems<User>(KEYS.USERS);
export const addUser = (user: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser = { ...user, id: generateId() };
  setItems(KEYS.USERS, [...users, newUser]);
  return newUser;
};
export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  setItems(KEYS.USERS, users);
};
export const findUser = (email: string, password: string, role: string): User | undefined => {
  return getUsers().find(u => u.email === email && u.password === password && u.role === role);
};

// Session operations
export const setSession = (user: User): void => {
  sessionStorage.setItem(KEYS.SESSION, JSON.stringify(user));
};
export const getSession = (): User | null => {
  const data = sessionStorage.getItem(KEYS.SESSION);
  return data ? JSON.parse(data) : null;
};
export const clearSession = (): void => {
  sessionStorage.removeItem(KEYS.SESSION);
};

// Message operations
export const getMessages = (): Message[] => getItems<Message>(KEYS.MESSAGES);
export const addMessage = (message: Omit<Message, 'id' | 'createdAt'>): Message => {
  const messages = getMessages();
  const newMessage = { ...message, id: generateId(), createdAt: new Date().toISOString() };
  setItems(KEYS.MESSAGES, [...messages, newMessage]);
  return newMessage;
};

// Donation operations
export const getDonations = (): Donation[] => getItems<Donation>(KEYS.DONATIONS);
export const addDonation = (donation: Omit<Donation, 'id' | 'transactionId' | 'createdAt'>): Donation => {
  const donations = getDonations();
  const newDonation = { 
    ...donation, 
    id: generateId(), 
    transactionId: generateTransactionId(),
    createdAt: new Date().toISOString() 
  };
  setItems(KEYS.DONATIONS, [...donations, newDonation]);
  return newDonation;
};

// Report operations
export const getReports = (): Report[] => getItems<Report>(KEYS.REPORTS);
export const addReport = (report: Omit<Report, 'id' | 'createdAt'>): Report => {
  const reports = getReports();
  const newReport = { ...report, id: generateId(), createdAt: new Date().toISOString() };
  setItems(KEYS.REPORTS, [...reports, newReport]);
  return newReport;
};

// External report operations
export const getExternalReports = (): ExternalReport[] => getItems<ExternalReport>(KEYS.EXTERNAL_REPORTS);
export const addExternalReport = (report: Omit<ExternalReport, 'id' | 'sharedAt'>): ExternalReport => {
  const reports = getExternalReports();
  const newReport = { ...report, id: generateId(), sharedAt: new Date().toISOString() };
  setItems(KEYS.EXTERNAL_REPORTS, [...reports, newReport]);
  return newReport;
};

// Fund request operations
export const getFundRequests = (): FundRequest[] => getItems<FundRequest>(KEYS.FUND_REQUESTS);
export const addFundRequest = (request: Omit<FundRequest, 'id' | 'status' | 'createdAt'>): FundRequest => {
  const requests = getFundRequests();
  const newRequest = { 
    ...request, 
    id: generateId(), 
    status: 'pending' as const,
    createdAt: new Date().toISOString() 
  };
  setItems(KEYS.FUND_REQUESTS, [...requests, newRequest]);
  return newRequest;
};
export const updateFundRequest = (id: string, updates: Partial<FundRequest>): void => {
  const requests = getFundRequests().map(r => 
    r.id === id ? { ...r, ...updates } : r
  );
  setItems(KEYS.FUND_REQUESTS, requests);
};

// Distribution operations
export const getDistributions = (): Distribution[] => getItems<Distribution>(KEYS.DISTRIBUTIONS);
export const addDistribution = (distribution: Omit<Distribution, 'id' | 'distributedAt'>): Distribution => {
  const distributions = getDistributions();
  const newDistribution = { 
    ...distribution, 
    id: generateId(), 
    distributedAt: new Date().toISOString() 
  };
  setItems(KEYS.DISTRIBUTIONS, [...distributions, newDistribution]);
  return newDistribution;
};
