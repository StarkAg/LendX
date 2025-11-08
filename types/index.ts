export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, this should be hashed
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  type: "taken" | "returned";
  amount: number;
}

export interface Borrower {
  id: string;
  userId: string;
  name: string;
  interestRate: number; // per week percentage
  interestMethod: "simple" | "simple_with_repay" | "compound";
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface InterestCalculation {
  method: "simple" | "simple_with_repay" | "compound";
  totalInterest: number;
  principal: number;
  totalAmount: number;
  breakdown?: WeekBreakdown[];
}

export interface WeekBreakdown {
  week: number;
  startDate: string;
  endDate: string;
  principal: number;
  interest: number;
  balance: number;
}

export interface BorrowerSummary {
  totalTaken: number;
  totalReturned: number;
  currentBalance: number;
  interestCalculations: {
    simple: InterestCalculation;
    simpleWithRepay: InterestCalculation;
    compound: InterestCalculation;
  };
  dailyInterestRate: number;
}

