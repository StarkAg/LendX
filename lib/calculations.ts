import { Borrower, Transaction, InterestCalculation, WeekBreakdown } from "@/types";
import { differenceInWeeks, addWeeks, startOfWeek, endOfWeek, parseISO, format } from "date-fns";

export function calculateRunningBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === "taken") {
      return balance + transaction.amount;
    } else {
      return balance - transaction.amount;
    }
  }, 0);
}

export function calculateSimpleInterest(
  borrower: Borrower,
  transactions: Transaction[],
  asOfDate: Date = new Date()
): InterestCalculation {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let principal = 0;
  let totalInterest = 0;
  let currentBalance = 0;

  for (const transaction of sortedTransactions) {
    const transactionDate = parseISO(transaction.date);
    if (transactionDate > asOfDate) break;

    if (transaction.type === "taken") {
      currentBalance += transaction.amount;
      principal += transaction.amount;
    } else {
      currentBalance -= transaction.amount;
    }
  }

  // Calculate interest on final balance only
  if (sortedTransactions.length > 0) {
    const firstDate = parseISO(sortedTransactions[0].date);
    const weeks = differenceInWeeks(asOfDate, firstDate);
    totalInterest = (currentBalance * borrower.interestRate * weeks) / 100;
  }

  return {
    method: "simple",
    principal,
    totalInterest,
    totalAmount: currentBalance + totalInterest,
  };
}

export function calculateSimpleInterestWithRepayment(
  borrower: Borrower,
  transactions: Transaction[],
  asOfDate: Date = new Date()
): InterestCalculation {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedTransactions.length === 0) {
    return {
      method: "simple_with_repay",
      principal: 0,
      totalInterest: 0,
      totalAmount: 0,
    };
  }

  let totalInterest = 0;
  let currentBalance = 0;
  let previousDate = parseISO(sortedTransactions[0].date);

  for (const transaction of sortedTransactions) {
    const transactionDate = parseISO(transaction.date);
    if (transactionDate > asOfDate) break;

    // Calculate interest for the period since last transaction
    const weeksSinceLast = differenceInWeeks(transactionDate, previousDate);
    if (weeksSinceLast > 0 && currentBalance > 0) {
      totalInterest += (currentBalance * borrower.interestRate * weeksSinceLast) / 100;
    }

    // Apply transaction
    if (transaction.type === "taken") {
      currentBalance += transaction.amount;
    } else {
      currentBalance -= transaction.amount;
    }

    previousDate = transactionDate;
  }

  // Calculate interest from last transaction to asOfDate
  const weeksSinceLast = differenceInWeeks(asOfDate, previousDate);
  if (weeksSinceLast > 0 && currentBalance > 0) {
    totalInterest += (currentBalance * borrower.interestRate * weeksSinceLast) / 100;
  }

  const principal = sortedTransactions
    .filter((t) => parseISO(t.date) <= asOfDate)
    .reduce((sum, t) => sum + (t.type === "taken" ? t.amount : -t.amount), 0);

  return {
    method: "simple_with_repay",
    principal: Math.max(0, principal),
    totalInterest,
    totalAmount: currentBalance + totalInterest,
  };
}

export function calculateCompoundInterest(
  borrower: Borrower,
  transactions: Transaction[],
  asOfDate: Date = new Date()
): InterestCalculation {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedTransactions.length === 0) {
    return {
      method: "compound",
      principal: 0,
      totalInterest: 0,
      totalAmount: 0,
      breakdown: [],
    };
  }

  const firstDate = parseISO(sortedTransactions[0].date);
  const firstWeekStart = startOfWeek(firstDate, { weekStartsOn: 1 }); // Monday
  const asOfWeekStart = startOfWeek(asOfDate, { weekStartsOn: 1 });

  const totalWeeks = differenceInWeeks(asOfWeekStart, firstWeekStart) + 1;
  const breakdown: WeekBreakdown[] = [];

  let balance = 0;
  let transactionIndex = 0;

  for (let week = 0; week < totalWeeks; week++) {
    const weekStart = addWeeks(firstWeekStart, week);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // Apply all transactions that occurred before or during this week
    while (
      transactionIndex < sortedTransactions.length &&
      parseISO(sortedTransactions[transactionIndex].date) <= weekEnd &&
      parseISO(sortedTransactions[transactionIndex].date) <= asOfDate
    ) {
      const transaction = sortedTransactions[transactionIndex];
      if (transaction.type === "taken") {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      transactionIndex++;
    }

    // Calculate interest for this week (only if we're not past asOfDate)
    if (weekStart <= asOfDate) {
      const weeklyInterestRate = borrower.interestRate / 100;
      const interest = balance * weeklyInterestRate;
      balance += interest;

      breakdown.push({
        week: week + 1,
        startDate: format(weekStart, "yyyy-MM-dd"),
        endDate: format(weekEnd, "yyyy-MM-dd"),
        principal: balance - interest,
        interest,
        balance,
      });
    }
  }

  const principal = sortedTransactions
    .filter((t) => parseISO(t.date) <= asOfDate)
    .reduce((sum, t) => sum + (t.type === "taken" ? t.amount : -t.amount), 0);

  const finalBalance = breakdown.length > 0 ? breakdown[breakdown.length - 1].balance : 0;
  const totalInterest = finalBalance - Math.max(0, principal);

  return {
    method: "compound",
    principal: Math.max(0, principal),
    totalInterest,
    totalAmount: finalBalance,
    breakdown,
  };
}

export function getDailyInterestRate(weeklyRate: number): number {
  // Daily rate = (1 + weekly_rate/100)^(1/7) - 1
  return (Math.pow(1 + weeklyRate / 100, 1 / 7) - 1) * 100;
}

