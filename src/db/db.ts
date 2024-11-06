import Dexie, { type EntityTable } from "dexie";
import { decryptMessage, encryptMessage } from "../utils/aes";
import { isEmpty } from "../utils/utils";

interface Note {
  id: number;
  title: string;
  wallet: string;
  date: string;
  content: string;
}

const db = new Dexie("NotesDatabase") as Dexie & {
  notes: EntityTable<
    Note,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  notes: "++id, title, wallet, date, content", // primary key "id" (for the runtime!)
});

export type { Note };
export { db };

async function encryptNote(
  aesKey: CryptoKey,
  wallet: string,
  title?: string,
  date?: string,
  content?: string
) {
  const [_title, _date, _content] = await Promise.all(
    [title, date, content].map((item) => encryptMessage(item, aesKey))
  );
  return {
    title: JSON.stringify(_title),
    date: JSON.stringify(_date),
    content: JSON.stringify(_content),
    wallet,
  };
}
export async function decryptNote(aesKey: CryptoKey, note: Note) {
  const [content, date, title] = await Promise.all(
    [note.content, note.date, note.title].map((item) =>
      decryptMessage(JSON.parse(item), aesKey)
    )
  );
  return {
    ...note,
    content,
    date,
    title,
  };
}

export async function addNote(
  aesKey: CryptoKey,
  wallet: string,
  title: string,
  date: string,
  content: string
) {
  try {
    return await db.notes.add(
      await encryptNote(aesKey, wallet, title, date, content)
    );
  } catch (e) {
    console.error("[ADD NOTE ERROR] ", e);
    return null;
  }
}
export async function removeNote(id: number) {
  try {
    await db.notes.delete(id);
    return true;
  } catch (e) {
    console.error("[ADD NOTE ERROR] ", e);
    return false;
  }
}
export async function getWalletNotes(wallet: string) {
  try {
    return await db.notes.where({ wallet }).toArray();
  } catch (e) {
    console.error("[GET NOTES ERROR] ", e);
    return [];
  }
}
export async function getNote(id: number) {
  try {
    return await db.notes.where({ id }).first();
  } catch (e) {
    console.error("[GET NOTES ERROR] ", e);
    return null;
  }
}

export async function updateNote(
  id: number,
  aesKey: CryptoKey,
  updateInfo: { title?: string; date?: string; content?: string }
) {
  try {
    const note = await getNote(id);
    if (!note) {
      throw new Error("Trying to update non-existing note");
    }
    let encrypted = await encryptNote(
      aesKey,
      note.wallet,
      updateInfo.title,
      updateInfo.date,
      updateInfo.content
    );
    encrypted["title"] = isEmpty(encrypted.title)
      ? note.title
      : encrypted.title;
    encrypted["content"] = isEmpty(encrypted.content)
      ? note.content
      : encrypted.content;
    encrypted["date"] = isEmpty(encrypted.date) ? note.date : encrypted.date;
    await db.notes.update(id, encrypted);
  } catch (e) {
    console.error("[UPDATE NOTE ERROR] ", e);
  }
}
