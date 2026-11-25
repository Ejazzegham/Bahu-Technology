import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  read: boolean;
  createdAt: number;
};

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
}): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await addDoc(collection(getDb(), "messages"), {
    ...input,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeMessages(cb: (messages: ContactMessage[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured) {
    cb([]);
    return null;
  }
  const q = query(collection(getDb(), "messages"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: (data.name as string) ?? "",
            email: (data.email as string) ?? "",
            subject: (data.subject as string) ?? "",
            message: (data.message as string) ?? "",
            phone: (data.phone as string) || undefined,
            service: (data.service as string) || undefined,
            budget: (data.budget as string) || undefined,
            timeline: (data.timeline as string) || undefined,
            read: Boolean(data.read),
            createdAt: (data.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? Date.now(),
          };
        })
      ),
    () => cb([])
  );
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await updateDoc(doc(getDb(), "messages", id), { read });
}

export async function deleteMessage(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(getDb(), "messages", id));
}
