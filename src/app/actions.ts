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
  const isTempId = !session.id || String(session.id).startsWith('local-');
  const targetId = isTempId ? uuidv4() : session.id;

  const index = db.sessions.findIndex((s: any) => s.id === session.id || (isTempId && s.id === targetId));
  
  const sessionToSave = {
    ...session,
    id: targetId,
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.sessions[index] = sessionToSave;
  } else {
    db.sessions.unshift({ ...sessionToSave, createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString() });
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
  const isTempId = !bulletin.id || String(bulletin.id).startsWith('local-');
  const targetId = isTempId ? uuidv4() : bulletin.id;

  const index = db.bulletins.findIndex((b: any) => b.id === bulletin.id || (isTempId && b.id === targetId));
  
  const bulletinToSave = {
    ...bulletin,
    id: targetId,
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.bulletins[index] = bulletinToSave;
  } else {
    db.bulletins.unshift({ ...bulletinToSave, createdAt: bulletin.createdAt ? new Date(bulletin.createdAt).toISOString() : new Date().toISOString() });
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
  const isTempId = !note.id || String(note.id).startsWith('local-');
  const targetId = isTempId ? uuidv4() : note.id;

  const index = db.notes.findIndex((n: any) => n.id === note.id || (isTempId && n.id === targetId));
  
  const noteToSave = {
    ...note,
    id: targetId,
    updatedAt: new Date().toISOString(),
  };

  if (index > -1) {
    db.notes[index] = noteToSave;
  } else {
    db.notes.unshift({ ...noteToSave, createdAt: note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString() });
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
