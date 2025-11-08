import { User, Borrower, Transaction } from "@/types";

const STORAGE_KEYS = {
  USERS: "lendx_users",
  BORROWERS: "lendx_borrowers",
  CURRENT_USER: "lendx_current_user",
};

export const storage = {
  // User management
  getUsers(): User[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: User[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Borrower management
  getBorrowers(userId: string): Borrower[] {
    if (typeof window === "undefined") return [];
    const allBorrowers = this.getAllBorrowers();
    return allBorrowers.filter((b) => b.userId === userId);
  },

  getAllBorrowers(): Borrower[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.BORROWERS);
    return data ? JSON.parse(data) : [];
  },

  saveBorrower(borrower: Borrower): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getAllBorrowers();
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
    const borrowers = this.getAllBorrowers();
    const filtered = borrowers.filter((b) => b.id !== borrowerId);
    localStorage.setItem(STORAGE_KEYS.BORROWERS, JSON.stringify(filtered));
  },

  // Transaction management
  addTransaction(borrowerId: string, transaction: Transaction): void {
    if (typeof window === "undefined") return;
    const borrowers = this.getAllBorrowers();
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
    const borrowers = this.getAllBorrowers();
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
    const borrowers = this.getAllBorrowers();
    const borrower = borrowers.find((b) => b.id === borrowerId);
    if (borrower) {
      borrower.transactions = borrower.transactions.filter((t) => t.id !== transactionId);
      borrower.updatedAt = new Date().toISOString();
      this.saveBorrower(borrower);
    }
  },
};

