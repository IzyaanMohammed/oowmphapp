"use client";

import { useState, useEffect } from 'react';
import type { Announcement } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getBulletins, saveBulletin, deleteBulletin } from '@/app/actions';

interface AnnouncementsClientProps {
    initialBulletins: Announcement[];
}

export function AnnouncementsClient({ initialBulletins }: AnnouncementsClientProps) {
    const { toast } = useToast();
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialBulletins);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Announcement | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const interval = setInterval(async () => {
            const data = await getBulletins();
            setAnnouncements(data.map((b: any) => ({
                ...b,
                createdAt: new Date(b.createdAt),
                updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined
            })));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const openNew = () => {
        setEditing(null);
        setTitle('');
        setMessage('');
        setIsDialogOpen(true);
    };

    const openEdit = (ann: Announcement) => {
        setEditing(ann);
        setTitle(ann.title);
        setMessage(ann.message);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const bulletinToSave = {
                id: editing?.id,
                title,
                message,
                authorName: editing?.authorName || 'Staff',
            };

            const saved = await saveBulletin(bulletinToSave);
            
            setAnnouncements(prev => {
                const index = prev.findIndex(a => a.id === saved.id);
                if (index > -1) {
                    const updated = [...prev];
                    updated[index] = { ...saved, createdAt: new Date(saved.createdAt) };
                    return updated;
                }
                return [{ ...saved, createdAt: new Date(saved.createdAt) }, ...prev];
            });

            toast({ title: editing ? 'Announcement updated' : 'Announcement created' });
            setIsDialogOpen(false);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
        }
    };

    const onDelete = async (id: string) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            await deleteBulletin(id);
            toast({ title: 'Announcement deleted' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Global Announcements</h1>
                <Button onClick={openNew} className="bg-primary hover:bg-primary/90 font-bold shadow-sm">
                    New Announcement
                </Button>
            </div>
            <div className="grid gap-6">
                {announcements.map((ann) => (
                    <Card key={ann.id} className="border group transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div>
                                <CardTitle className="text-xl font-bold">{ann.title}</CardTitle>
                                <CardDescription className="mt-2 text-base leading-relaxed">{ann.message}</CardDescription>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="outline" size="sm" onClick={() => openEdit(ann)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => onDelete(ann.id)}>
                                    Delete
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                        <DialogDescription>{editing ? 'Update the announcement details.' : 'Create a new global announcement.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Title</label>
                            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Message</label>
                            <Textarea placeholder="Body" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-semibold">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold">
                            Save Announcement
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
