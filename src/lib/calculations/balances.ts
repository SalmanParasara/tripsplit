import type { Deposit, Expense, Member, MemberBalance } from "@/lib/types";

/** All money values are integer minor units. Deposits fund the shared pool only;
 * they are deliberately excluded from settlement net balances to prevent double counting.
 * Remaining pool = deposits - vendor expense payments. */
export function calculateExpenseShares(expense: Expense) { return expense.participants.map(({ uid, amount }) => ({ uid, amount })); }
export function calculateRemainingPool(deposits: Deposit[], expenses: Expense[]) { return deposits.reduce((s, d) => s + d.amount, 0) - expenses.reduce((s, e) => s + e.payments.reduce((p, x) => p + x.amount, 0), 0); }
export function calculateMemberBalances(members: Member[], expenses: Expense[], deposits: Deposit[]): MemberBalance[] {
  const values = new Map(members.map(m => [m.uid, { uid: m.uid, totalExpenseShare: 0, totalPaidForExpenses: 0, totalDeposited: 0, amountOwed: 0, amountToReceive: 0, netBalance: 0 }]));
  for (const e of expenses) { for (const p of e.participants) { const b=values.get(p.uid); if(b) b.totalExpenseShare+=p.amount; } for (const p of e.payments) { const b=values.get(p.uid); if(b) b.totalPaidForExpenses+=p.amount; } }
  for (const d of deposits) { const b=values.get(d.uid); if(b) b.totalDeposited+=d.amount; }
  return [...values.values()].map(b => { b.netBalance=b.totalPaidForExpenses-b.totalExpenseShare; b.amountOwed=Math.max(0,-b.netBalance); b.amountToReceive=Math.max(0,b.netBalance); return b; });
}
