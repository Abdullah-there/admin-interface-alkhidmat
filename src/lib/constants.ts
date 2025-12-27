export const categories = [
  { id: 'zakat', title: 'Zakat', description: 'Fulfill your religious obligation by giving Zakat to those in need.', icon: "Heart", color: '#22c55e', minAmount: 50 },
  { id: 'sadqah', title: 'Sadqah', description: 'Voluntary charity to earn blessings and help the less fortunate.', icon: "HandHeart", color: '#f59e0b', minAmount: 10 },
  { id: 'education', title: 'Education', description: 'Support underprivileged students with scholarships and resources.', icon: "BookOpen", color: '#3b82f6', minAmount: 25 },
  { id: 'health', title: 'Health', description: 'Fund medical treatments and healthcare for those who cannot afford it.', icon: "Stethoscope", color: '#ef4444', minAmount: 30 },
  { id: 'emergency', title: 'Emergency Relief', description: 'Provide immediate aid to disaster victims and crisis situations.', icon: "AlertTriangle", color: '#8b5cf6', minAmount: 20 },
  { id: 'gaza', title: 'Gaza Funds', description: 'Provide immediate aid to Gaza civilians and rebuild resources.', icon: "AlertTriangle", color: '#8b5cf6', minAmount: 20 },
] as const;

export type CategoryId = typeof categories[number]['id'];

export const paymentMethods = ['Cash', 'Online Wallet', 'Bank Transfer'] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const roles = ['Finance Officer', 'Finance Administrator', 'Program Manager'] as const;
export type Role = typeof roles[number];

export type User = {
  id?: string;
  email: string;
  password?: string;
  role: Role;
};

export type Message = {
  id?: string;
  title: string;
  message: string;
  user_email: string;
  message_by: string;
  created_at: string;
};

export type Donation = {
  id?: string;
  transactionId: string;
  user_email: string;
  category: CategoryId;
  amount: number;
  payment_method: PaymentMethod;
  status: 'success' | 'pending' | 'failed';
  created_at?: string;
};

export type Report = {
  id?: string;
  title: string;
  totalDonations: number;
  donationsByCategory: Record<string, number>;
  transactionCount: number;
  createdBy: string;
  created_at?: string;
  sharedWith?: string[];
};

export type FundReport = {
  id?: string;
  title: string;
  totalFunds: number;
  totalDistributed: number;
  FundsByCategory: Record<string, number>;
  FundsByStatus: Record<string, number>;
  transactionCount: number;
  createdBy: string;
  sharedWith?: string[];
  created_at?: string;
}

export type ExternalReport = {
  id?: string;
  reportId: string;
  notes: string;
  sharedTo: 'auditor' | 'government';
  sharedBy: string;
  created_at: string;
};

export type FundRequest = {
  id?: string;
  amount: number;
  category: CategoryId;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  created_at: string;
  rejectionReason?: string;
  remainingAmount: number;
  approvedAt?: string;
};

export type Distribution = {
  id?: string;
  fundRequestId: string;
  beneficiaries: { name: string; amount: number }[];
  category: CategoryId;
  distributedBy: string;
  created_at: string;
};
