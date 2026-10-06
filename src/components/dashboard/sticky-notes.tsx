"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, StickyNote, Pin, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { getNotes, saveNote, deleteNote } from "@/app/actions";
import { useAuth } from "@/context/auth-context";

const COLORS = [
  "bg-amber-50/80 border-amber-200/70 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-100",
  "bg-blue-50/80 border-blue-200/70 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-100",
  "bg-emerald-50/80 border-emerald-200/70 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-100",
  "bg-purple-50/80 border-purple-200/70 text-purple-950 dark:bg-purple-950/30 dark:border-purple-900/40 dark:text-purple-100",
];

export function StickyNotes() {
  const { user, role } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = role === 'admin';

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data.map((n: any) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
      })));
    } catch (e) {
      console.error('Fetch notes error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    const newNote: Note = {
      id: uuidv4(),
      content: "",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: new Date(),
    };
    
    setNotes(prev => [{ ...newNote, authorId: user?.personalId } as any, ...prev]);
    await saveNote({ ...newNote, authorId: user?.personalId });
  };

  const updateNote = async (id: string, content: string) => {
    const noteToUpdate = notes.find(n => n.id === id);
    if (!noteToUpdate) return;

    const canEdit = isAdmin || !(noteToUpdate as any).authorId || (noteToUpdate as any).authorId === user?.personalId;
    if (!canEdit) return;

    setNotes(notes.map((n) => (n.id === id ? { ...n, content } : n)));
    await saveNote({ ...noteToUpdate, content, authorId: (noteToUpdate as any).authorId || user?.personalId });
  };

  const onDeleteNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    const canDelete = isAdmin || !note || !(note as any).authorId || (note as any).authorId === user?.personalId;

    if (!canDelete) {
      alert("Only administrators or the original author can delete this note.");
      return;
    }

    setNotes(notes.filter((n) => n.id !== id));
    await deleteNote(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Quick Workspace</h2>
          <p className="text-xs text-zinc-500 font-medium">Keep track of temporary thoughts and session reminders.</p>
        </div>
        <Button onClick={addNote} className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-md shadow-xs h-9 px-4 active:scale-[0.98] transition-all">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Note
        </Button>
      </div>

      {isLoading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[180px] rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/60 dark:border-zinc-800" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 text-center border-zinc-200/80">
          <StickyNote className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="font-semibold text-base text-zinc-800 dark:text-zinc-200">Workspace is empty</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-5">Create a sticky note for session ideas or quick to-dos.</p>
          <Button variant="outline" onClick={addNote} className="font-semibold text-xs rounded-md border-zinc-300 h-9">
            Create first note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => {
            const isOwner = !(note as any).authorId || (note as any).authorId === user?.personalId;
            const canModify = isAdmin || isOwner;
            
            return (
              <div
                key={note.id}
                className={cn(
                  "relative group min-h-[180px] p-5 pt-8 rounded-xl shadow-xs border transition-all duration-200",
                  note.color,
                  !canModify && "opacity-70 grayscale-[0.3]"
                )}
              >
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2">
                  <Pin className="h-4 w-4 text-zinc-400 rotate-45 opacity-60" />
                </div>
                
                {!canModify && (
                  <div className="absolute top-2.5 left-3">
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                )}
                
                {isAdmin && !isOwner && (
                  <div className="absolute top-2.5 left-3">
                    <Crown className="h-3.5 w-3.5 text-amber-600/70" />
                  </div>
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => onDeleteNote(note.id)}
                    disabled={!canModify}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-500" />
                  </Button>
                </div>
                <Textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  placeholder="Type note..."
                  readOnly={!canModify}
                  className={cn(
                    "bg-transparent border-none focus-visible:ring-0 resize-none h-full w-full p-0 text-sm leading-relaxed placeholder:text-zinc-400 font-medium",
                    !canModify && "cursor-not-allowed"
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
