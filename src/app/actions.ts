'use server';

import { readDb, writeDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function getSessions() {
  const db = await readDb();
  return db.sessions;
}

export async function saveSession(session: any) {
  const db = await readDb();
  const index = db.sessions.findIndex((s: any) => s.id === session.id);
  
  const sessionToSave = {
    ...session,
    id: session.id || uuidv4(),
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.sessions[index] = sessionToSave;
  } else {
    db.sessions.unshift({ ...sessionToSave, createdAt: new Date().toISOString() });
  }
  
  await writeDb(db);
  revalidatePath('/dashboard');
  return sessionToSave;
}

export async function deleteSession(id: string) {
  const db = await readDb();
  db.sessions = db.sessions.filter((s: any) => s.id !== id);
  await writeDb(db);
  revalidatePath('/dashboard');
}

export async function getBulletins() {
  const db = await readDb();
  return db.bulletins;
}

export async function saveBulletin(bulletin: any) {
  const db = await readDb();
  const index = db.bulletins.findIndex((b: any) => b.id === bulletin.id);
  
  const bulletinToSave = {
    ...bulletin,
    id: bulletin.id || uuidv4(),
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.bulletins[index] = bulletinToSave;
  } else {
    db.bulletins.unshift({ ...bulletinToSave, createdAt: new Date().toISOString() });
  }
  
  await writeDb(db);
  revalidatePath('/dashboard');
  return bulletinToSave;
}

export async function deleteBulletin(id: string) {
  const db = await readDb();
  db.bulletins = db.bulletins.filter((b: any) => b.id !== id);
  await writeDb(db);
  revalidatePath('/dashboard');
}

export async function getNotes() {
  const db = await readDb();
  return db.notes;
}

export async function saveNote(note: any) {
  const db = await readDb();
  const index = db.notes.findIndex((n: any) => n.id === note.id);
  
  const noteToSave = {
    ...note,
    id: note.id || uuidv4(),
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.notes[index] = noteToSave;
  } else {
    db.notes.unshift({ ...noteToSave, createdAt: new Date().toISOString() });
  }
  
  await writeDb(db);
  revalidatePath('/dashboard');
  return noteToSave;
}

export async function deleteNote(id: string) {
  const db = await readDb();
  db.notes = db.notes.filter((n: any) => n.id !== id);
  await writeDb(db);
  revalidatePath('/dashboard');
}

export async function clearDatabase() {
  const db = await readDb();
  db.sessions = [];
  db.bulletins = [];
  db.notes = [];
  await writeDb(db);
  revalidatePath('/dashboard');
}
