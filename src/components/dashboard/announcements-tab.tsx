"use client";

import { useState, memo, useEffect } from "react";
import type { Announcement } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AnnouncementList } from "./announcement-list";
import { Megaphone, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { getBulletins, saveBulletin, deleteBulletin } from "@/app/actions";
import { useAuth } from "@/context/auth-context";

interface AnnouncementFormState {
  id?: string;
  title: string;
  message: string;
  authorName: string;
}

export const AnnouncementsTab = memo(function AnnouncementsTab() {
  const { user, role } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<AnnouncementFormState>({
    title: "",
    message: "",
    authorName: "",
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = role === 'admin';

  const fetchBulletins = async () => {
    try {
      const data = await getBulletins();
      setAnnouncements(data.map((b: any) => ({
        ...b,
        createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined
      })));
    } catch (e) {
      console.error('Fetch bulletins error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBulletins();
  }, []);

  const openCreate = () => {
    setFormState({ title: "", message: "", authorName: isAdmin ? "Administrator" : (user?.name || "Staff Member") });
    setIsDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    const canEdit = isAdmin || !(a as any).authorId || (a as any).authorId === user?.personalId;
    if (!canEdit) {
      alert("Only administrators or the original author can edit this bulletin.");
      return;
    }
    setFormState({ id: a.id, title: a.title, message: a.message, authorName: a.authorName });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const { id, title, message, authorName } = formState;
    if (!title.trim() || !message.trim()) return;

    const originalBulletin = announcements.find(a => a.id === id);
    const authorIdToSave = originalBulletin ? (originalBulletin as any).authorId : user?.personalId;
    const tempId = id || `local-${Date.now()}`;

    const optimisticBulletin: Announcement = {
      id: tempId,
      title: title.trim(),
      message: message.trim(),
      authorName: authorName.trim() || "Staff Member",
      createdAt: originalBulletin?.createdAt || new Date(),
    };

    // Instant optimistic UI update
    setAnnouncements(prev => {
      const index = prev.findIndex(a => a.id === tempId);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = { ...optimisticBulletin, authorId: authorIdToSave } as any;
        return updated;
      }
      return [{ ...optimisticBulletin, authorId: user?.personalId } as any, ...prev];
    });

    setIsDialogOpen(false);

    // Persist to server
    const saved = await saveBulletin({ ...optimisticBulletin, authorId: authorIdToSave || user?.personalId });
    if (saved && saved.id) {
      setAnnouncements(prev => prev.map(a => a.id === tempId ? {
        ...saved,
        createdAt: new Date(saved.createdAt)
      } as any : a));
    }
  };

  const confirmDelete = (ann: Announcement) => {
    const canDelete = isAdmin || !(ann as any).authorId || (ann as any).authorId === user?.personalId;
    if (!canDelete) {
      alert("Only administrators or the original author can delete this bulletin.");
      return;
    }
    setPendingDeleteId(ann.id);
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setAnnouncements(prev => prev.filter(a => a.id !== pendingDeleteId));
    await deleteBulletin(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-4 px-6">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            Bulletins
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 font-medium">Official announcements and high-priority updates.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreate} className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-md shadow-xs h-9 px-4 active:scale-[0.98] transition-all">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnnouncementList
          announcements={announcements}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={(id) => {
            const ann = announcements.find(a => a.id === id);
            if (ann) confirmDelete(ann);
          }}
        />
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-zinc-200/80 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {formState.id ? "Edit Bulletin" : "Create Bulletin"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 font-medium">
              Publish an official announcement to the staff portal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Headline</Label>
              <Input
                value={formState.title}
                onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
                placeholder="Announcement headline"
                className="font-semibold text-sm rounded-lg border-zinc-200 focus:ring-zinc-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Message</Label>
              <Textarea
                value={formState.message}
                onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                rows={4}
                placeholder="Provide announcement details..."
                className="resize-none text-sm rounded-lg border-zinc-200 focus:ring-zinc-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Author</Label>
              <Input
                value={formState.authorName}
                onChange={(e) => setFormState((s) => ({ ...s, authorName: e.target.value }))}
                placeholder="Author display name"
                className="text-sm rounded-lg border-zinc-200 focus:ring-zinc-900"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-md text-xs font-semibold h-9">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold h-9 px-4">
              {formState.id ? "Update Bulletin" : "Publish Bulletin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-zinc-200/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Bulletin?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500">
              This action will permanently remove this announcement from the staff portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md text-xs font-semibold h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold h-9">
              Delete Bulletin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});
