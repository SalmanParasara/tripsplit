import type { MemberBalance, Settlement } from "@/lib/types";
export function calculateSettlement(balances: MemberBalance[]): Settlement[] {
  const debtors=balances.filter(b=>b.netBalance<0).map(b=>({uid:b.uid, amount:-b.netBalance}));
  const creditors=balances.filter(b=>b.netBalance>0).map(b=>({uid:b.uid, amount:b.netBalance})); const result:Settlement[]=[]; let i=0,j=0;
  while(i<debtors.length&&j<creditors.length){const amount=Math.min(debtors[i].amount,creditors[j].amount); if(amount)result.push({fromUid:debtors[i].uid,toUid:creditors[j].uid,amount,status:"pending"}); debtors[i].amount-=amount;creditors[j].amount-=amount;if(!debtors[i].amount)i++;if(!creditors[j].amount)j++;} return result;
}
