export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CURRENT" | "SALARY" | "FIXED_DEPOSIT";
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  categoryName: string;
  merchant: string;
  description: string;
  transactionDate: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
  createdAt: string;
}

export interface FinancialHealthScore {
  id: string;
  score: number;
  savingsRate: number;
  debtRatio: number;
  investmentDiversityScore: number;
  emergencyFundMonths: number;
  spendingDisciplineScore: number;
  incomeStabilityScore: number;
  calculatedAt: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface AnalyticsSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  lastMonthIncome: number;
  lastMonthExpenses: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  accountBalance: number;
  spendingByCategory: SpendingCategory[];
  monthlyTrends: MonthlyTrend[];
  insights: string[];
}

export interface Recommendation {
  id: string;
  type: "INVESTMENT" | "SAVINGS" | "TAX_SAVING" | "RETIREMENT" | "GOAL" | "DEBT";
  title: string;
  description: string;
  instrument: string;
  suggestedMonthlyAmount: number;
  expectedReturn: string;
  priority: number;
  status: "ACTIVE" | "ACCEPTED" | "DISMISSED";
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "ALERT" | "MILESTONE" | "WARNING" | "INSIGHT";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
