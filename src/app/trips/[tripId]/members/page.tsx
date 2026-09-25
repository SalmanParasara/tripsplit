"use client";
import { useEffect, useMemo, useState } from "react";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { TripShell } from "@/components/trips/TripShell";
import { useTrip } from "@/components/trips/TripProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";

type DirectoryUser = { uid: string; name: string; email: string; photoURL: string | null };

function View() {
  const { trip, members } = useTrip();
  const { user } = useAuth();
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isOwner = trip?.ownerId === user?.uid;

  useEffect(() => onSnapshot(collection(db, "users"), snapshot => {
    setDirectory(snapshot.docs.map(item => item.data() as DirectoryUser));
  }, () => setMessage("Could not load the user directory. Publish the updated Firestore rules.")), []);

  const available = useMemo(() => directory.filter(person => !members.some(member => member.uid === person.uid)), [directory, members]);
  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    const person = available.find(candidate => candidate.email === selectedEmail);
    if (!trip || !person) { setMessage("Choose an existing TripSplit user by email."); return; }
    setSaving(true); setMessage("");
    try {
      await setDoc(doc(db, "trips", trip.id, "members", person.uid), {
        uid: person.uid, name: person.name, email: person.email, photoURL: person.photoURL,
        role: "member", joinedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "trips", trip.id), { memberIds: arrayUnion(person.uid), updatedAt: serverTimestamp() });
      setSelectedEmail(""); setOpen(false); setMessage(`${person.name} can now see this trip.`);
    } catch { setMessage("Could not add this member. Only the trip owner can add members."); }
    finally { setSaving(false); }
  }
  async function removeMember(person: DirectoryUser) {
    if (!trip || !window.confirm(`Remove ${person.name} from this trip?`)) return;
    setSaving(true); setMessage("");
    try {
      await deleteDoc(doc(db, "trips", trip.id, "members", person.uid));
      await updateDoc(doc(db, "trips", trip.id), { memberIds: arrayRemove(person.uid), updatedAt: serverTimestamp() });
      setMessage(`${person.name} was removed from this trip.`);
    } catch { setMessage("Could not remove this member. Please try again."); }
    finally { setSaving(false); }
  }

  return <>
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Members</h2>{isOwner && <button className="btn" onClick={() => setOpen(value => !value)}>{open ? "Close" : "Add member"}</button>}</div>
    {isOwner && open && <form className="card mt-4 grid gap-3" onSubmit={addMember}><label><span className="label">Existing user email</span><input className="field" type="email" list="trip-users" value={selectedEmail} onChange={event => setSelectedEmail(event.target.value)} placeholder="Choose or type an email" required/><datalist id="trip-users">{available.map(person => <option key={person.uid} value={person.email}>{person.name}</option>)}</datalist></label><p className="text-sm muted">Only users who have already signed in to TripSplit are listed.</p><button className="btn" disabled={saving || !selectedEmail}>{saving ? "Adding…" : "Add member"}</button></form>}
    {message && <p className="mt-4 text-sm text-teal-800" role="status">{message}</p>}
    <div className="mt-4 grid gap-3">{members.map(member => <div className="card flex items-center gap-3" key={member.uid}>{member.photoURL ? <img className="h-10 w-10 rounded-full" src={member.photoURL} alt=""/> : <div className="grid h-10 w-10 place-items-center rounded-full bg-mint font-bold">{member.name[0]}</div>}<div className="min-w-0 flex-1"><b>{member.name}</b><p className="text-sm muted">{member.email} · <span className="capitalize">{member.role}</span></p></div>{isOwner && member.role !== "owner" && <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700" disabled={saving} onClick={() => removeMember(member)}>Remove</button>}</div>)}</div>
  </>;
}
export default function Page(){return <TripShell><View/></TripShell>}
