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
  "bg-yellow-50 border-yellow-200 text-yellow-900",
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-green-50 border-green-200 text-green-900",
  "bg-pink-50 border-pink-200 text-pink-900",
];

export function StickyNotes() {
  const { user, role } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = role === 'admin';

  const fetchNotes = async () => {
    const data = await getNotes();
    setNotes(data.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
    })));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 8000);
    return () => clearInterval(interval);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Quick Workspace</h2>
          <p className="text-muted-foreground">Keep track of temporary thoughts and session reminders.</p>
        </div>
        <Button onClick={addNote} className="bg-primary hover:bg-primary/90 font-bold shadow-sm h-10 px-4">
          <Plus className="mr-2 h-4 w-4" /> New Note
        </Button>
      </div>

      {isLoading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[200px] rounded-lg bg-muted/20 animate-pulse border-2 border-dashed border-muted" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/5 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="font-bold text-lg">Your workspace is empty</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Create a sticky note for session ideas or quick to-dos.</p>
          <Button variant="outline" onClick={addNote} className="font-semibold border-2">
            Create first note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => {
            const isOwner = !(note as any).authorId || (note as any).authorId === user?.personalId;
            const canModify = isAdmin || isOwner;
            
            return (
                <div
                  key={note.id}
                  className={cn(
                    "relative group min-h-[200px] p-6 pt-10 rounded-lg shadow-sm border transition-all animate-in zoom-in-95 duration-300",
                    note.color,
                    !canModify && "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Pin className="h-5 w-5 text-gray-400 rotate-45 opacity-50" />
                  </div>
                  
                  {!canModify && (
                    <div className="absolute top-2 left-2">
                        <Lock className="h-3 w-3 text-black/20" />
                    </div>
                  )}
                  
                  {isAdmin && !isOwner && (
                    <div className="absolute top-2 left-2">
                        <Crown className="h-3 w-3 text-amber-600/40" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-black/5"
                      onClick={() => onDeleteNote(note.id)}
                      disabled={!canModify}
                    >
                      <Trash2 className="h-4 w-4 text-black/30" />
                    </Button>
                  </div>
                  <Textarea
                    value={note.content}
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Start typing..."
                    readOnly={!canModify}
                    className={cn(
                        "bg-transparent border-none focus-visible:ring-0 resize-none h-full w-full p-0 text-lg leading-relaxed placeholder:text-black/10 font-semibold",
                        !canModify && "cursor-not-allowed"
                    )}
                  />
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
