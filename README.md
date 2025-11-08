# LendX - Multi-User Loan Tracking Application

A comprehensive loan tracking web application built with Next.js, React, and TypeScript. Track multiple borrowers, calculate interest using three different methods, and export data to Excel or PDF.

## Features

### 🏦 User Management
- Simple login/signup system
- Each user can track multiple borrowers
- Dashboard showing all active loans

### 💰 Loan Entry Interface
- Quick transaction entry form
- Support for "Taken" and "Returned" transactions
- One-click "Add Transaction" button
- Running balance display per borrower
- Total outstanding across all borrowers

### 📊 Interest Calculation
- **Three calculation methods:**
  1. Simple Interest (without repayment consideration)
  2. Simple Interest (with repayment consideration)
  3. Compound Interest (weekly compounding)
- Side-by-side comparison of all methods
- Configurable interest rate (default: 10% per week)
- Calculate interest up to any date (not just today)

### 📋 Borrower Detail View
- Complete transaction history table
- Color-coded transactions (Blue for "Taken", Green for "Returned")
- Summary section with:
  - Total taken
  - Total returned
  - Current balance by each method
  - Daily interest rate
- Week-by-week breakdown for compound interest

### 🔍 Advanced Features
- Date range filtering
- Edit/delete transactions
- "What-if" calculator (calculate future balance on any date)
- Export to Excel/PDF
- Search and filter by date range

### 🎨 UI/UX
- Clean, modern, mobile-responsive design
- Indian Rupee (₹) formatting throughout
- Date format: DD MMM (e.g., "1st Oct", "8th Nov")
- Quick actions from any page
- Offline-first functionality (browser storage)

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Date Handling:** date-fns
- **Export:** xlsx (Excel), jsPDF (PDF)
- **Storage:** localStorage (can be upgraded to backend)

## Repository & Deployment

🌐 **GitHub:** [https://github.com/StarkAg/LendX](https://github.com/StarkAg/LendX)

🚀 **Live Demo:** [https://lendx-starkags-projects.vercel.app](https://lendx-starkags-projects.vercel.app)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StarkAg/LendX.git
cd LendX
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Creating an Account
1. Click "Sign up" on the login page
2. Enter username, email, and password
3. Click "Sign Up"

### Adding a Borrower
1. Click "+ Add Transaction" on the dashboard
2. Click "+ Add new borrower"
3. Enter borrower name, interest rate, and calculation method
4. Click "Add Transaction"

### Adding Transactions
1. Click "+ Add Transaction" button
2. Select borrower (or create new one)
3. Choose transaction type (Taken/Returned)
4. Enter amount and date
5. Click "Add Transaction"

### Viewing Borrower Details
1. Click on a borrower name from the dashboard
2. View transaction history and interest calculations
3. Use date filters to see specific periods
4. Edit or delete transactions as needed

### Exporting Data
1. Navigate to borrower detail page
2. Click "Export to Excel" or "Export to PDF"
3. File will download automatically

## Data Structure

### User
```typescript
{
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}
```

### Borrower
```typescript
{
  id: string;
  userId: string;
  name: string;
  interestRate: number; // per week percentage
  interestMethod: "simple" | "simple_with_repay" | "compound";
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}
```

### Transaction
```typescript
{
  id: string;
  date: string; // ISO date string
  type: "taken" | "returned";
  amount: number;
}
```

## Interest Calculation Methods

### 1. Simple Interest (No Repayment)
Calculates interest on the final balance only, from the first transaction date to the calculation date.

### 2. Simple Interest (With Repayment)
Calculates interest on the balance after each transaction, considering repayments.

### 3. Compound Interest
Calculates interest weekly with compounding. Interest is added to the principal each week.

## Future Enhancements

- Backend API integration
- Database storage
- Payment reminder notifications
- Advanced reporting
- Multi-currency support
- Email notifications

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
