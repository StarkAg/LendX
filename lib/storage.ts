import { User, Borrower, Transaction } from "@/types";

const STORAGE_KEYS = {
  USERS: "lendx_users",
  BORROWERS: "lendx_borrowers",
  CURRENT_USER: "lendx_current_user",
};

const DEFAULT_USER_ID = "default_user";

export const storage = {
  // Borrower management (no user filtering needed)
  getBorrowers(): Borrower[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.BORROWERS);
    return data ? JSON.parse(data) : [];
  },

  getAllBorrowers(): Borrower[] {
    return this.getBorrowers();
  },

  saveBorrower(borrower: Borrower): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getBorrowers();
    const index = borrowers.findIndex((b) => b.id === borrower.id);
    if (index >= 0) {
      borrowers[index] = borrower;
    } else {
      borrowers.push(borrower);
    }
    localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify(borrowers));
  },

  deleteBorrower(borrowerId: string): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getBorrowers();
    const filtered = borrowers.filter((b) => b.id !== borrowerId);
    localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify(filtered));
  },

  // Transaction management
  addTransaction(borrowerId: string, transaction: Transaction): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === borrowerId);
    if (borrower) {
      borrower.transactions.push(transaction);
      borrower.transactions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      borrower.updatedAt = new Date().toISOString();
      this.saveBorrower(borrower);
    }
  },

  updateTransaction(borrowerId: string, transactionId: string, updates: Partial<Transaction>): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === borrowerId);
    if (borrower) {
      const transaction = borrower.transactions.find((t) => t.id === transactionId);
      if (transaction) {
        Object.assign(transaction, updates);
        borrower.transactions.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        borrower.updatedAt = new Date().toISOString();
        this.saveBorrower(borrower);
      }
    }
  },

  deleteTransaction(borrowerId: string, transactionId: string): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getBorrowers();
    const borrower = borrowers.find((b) => b.id === borrowerId);
    if (borrower) {
      borrower.transactions = borrower.transactions.filter((t) => t.id !== transactionId);
      borrower.updatedAt = new Date().toISOString();
      this.saveBorrower(borrower);
    }
  },
};
