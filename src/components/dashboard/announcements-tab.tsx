"use client";

import { useState, memo, useMemo, useEffect } from "react";
import type { Announcement } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AnnouncementList } from "./announcement-list";
import { Megaphone, Plus, Lock } from "lucide-react";
import { Badge } from "../ui/badge";
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
    const data = await getBulletins();
    setAnnouncements(data.map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined
    })));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBulletins();
    // Polling removed to prevent server exhaustion.
  }, []);

  const openCreate = () => {
    setFormState({ title: "", message: "", authorName: isAdmin ? "Administrator" : (user?.name || "") });
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

    const optimisticBulletin: Announcement = {
      id: id || `local-${Date.now()}`,
      title,
      message,
      authorName,
      createdAt: new Date(),
    };

    setAnnouncements(prev => {
        const index = prev.findIndex(a => a.id === optimisticBulletin.id);
        if (index > -1) {
            const updated = [...prev];
            updated[index] = { ...optimisticBulletin, authorId: authorIdToSave } as any;
            return updated;
        }
        return [{ ...optimisticBulletin, authorId: user?.personalId } as any, ...prev];
    });

    await saveBulletin({ ...optimisticBulletin, authorId: authorIdToSave || user?.personalId });
    setIsDialogOpen(false);
    fetchBulletins();
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
    <Card className="border shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 py-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Bulletins
          </CardTitle>
          <CardDescription>Official announcements and high-priority updates.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 font-bold shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {formState.id ? "Edit Bulletin" : "Create Bulletin"}
            </DialogTitle>
            <DialogDescription>
              Write an announcement for the staff portal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={formState.title}
                onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
                placeholder="Enter title"
                className="font-semibold"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={formState.message}
                onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                rows={5}
                placeholder="Details..."
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={formState.authorName}
                onChange={(e) => setFormState((s) => ({ ...s, authorName: e.target.value }))}
                placeholder="Your name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold">
              {formState.id ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bulletin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});
