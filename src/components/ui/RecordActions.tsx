"use client";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = { tripId: string; collectionName: "expenses" | "deposits"; recordId: string; title: string; amount: number; date: Date; titleField: "title" | "name"; onMessage: (message: string) => void };
export function RecordActions({ tripId, collectionName, recordId, title, amount, date, titleField, onMessage }: Props) {
  const record = doc(db, "trips", tripId, collectionName, recordId);
  async function edit() {
    const nextTitle = window.prompt(collectionName === "expenses" ? "Expense name" : "Deposit name", title); if (nextTitle === null || !nextTitle.trim()) return;
    const nextAmount = window.prompt("Amount", (amount / 100).toFixed(2)); if (nextAmount === null) return;
    const money = Math.round(Number(nextAmount) * 100); if (!Number.isFinite(money) || money <= 0) { onMessage("Enter a valid amount greater than zero."); return; }
    const nextDate = window.prompt("Date (YYYY-MM-DD)", date.toISOString().slice(0, 10)); if (nextDate === null || Number.isNaN(new Date(nextDate).getTime())) { onMessage("Enter a valid date."); return; }
    try { await updateDoc(record, { [titleField]: nextTitle.trim(), amount: money, date: new Date(nextDate) }); onMessage("Saved changes."); } catch { onMessage("Could not save changes. Please try again."); }
  }
  async function remove() { if (!window.confirm(`Delete this ${collectionName === "expenses" ? "expense" : "deposit"}?`)) return; try { await deleteDoc(record); onMessage("Deleted successfully."); } catch { onMessage("Could not delete this record. Please try again."); } }
  return <div className="flex gap-2"><button className="text-sm font-bold text-teal-800" onClick={edit}>Edit</button><button className="text-sm font-bold text-red-700" onClick={remove}>Delete</button></div>;
}
