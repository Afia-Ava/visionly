import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Board {
  category: string;
  createdAt?: any; // Will be set automatically
  description: string;
  images: { name: string; url: string }[];
  name: string;
  userId: string;
}

export async function saveBoard(board: Omit<Board, "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, "boards"), {
      ...board,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding board: ", e);
    throw e;
  }
}
