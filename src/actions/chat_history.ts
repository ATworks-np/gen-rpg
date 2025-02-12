import {db} from "@/libs/firebase";
import { collection, getDocs,addDoc, serverTimestamp, orderBy, query } from "firebase/firestore";
import {IMessage} from "@/models/interfaces/message";

export async function getChatHistory(story_id: string) {
  const historyQuery = query(
    collection(db, "chats", story_id, "history"),
    orderBy("timestamp", "asc")
  );
  const querySnapshot = await getDocs(historyQuery);

  const res: IMessage[] = [];
  let id = 0;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    res.push({
      id: id++,
      role: data.role,
      text: data.text
    })
  });

  return res
}

export async function setChat(story_id: string, chat: {role: "function" | "user" | "model" | "system", text: string }) {
  // Add a new document in collection "cities"
  const data = {
    role: chat.role,
    text: chat.text,
    uid: '',
    timestamp: serverTimestamp()
  }
  await addDoc(collection(db, "chats", story_id, "history"), data);
}