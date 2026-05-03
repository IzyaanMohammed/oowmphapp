"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, BookOpen, Star, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const TEACHERS = [
  { id: 1, name: "John Smith", role: "Senior Web Developer", email: "john@mph.com", sessions: 42, rating: 4.9, avatar: "" },
  { id: 2, name: "Sarah Wilson", role: "Digital Marketing Lead", email: "sarah@mph.com", sessions: 38, rating: 4.8, avatar: "" },
  { id: 3, name: "Michael Chen", role: "UI/UX Designer", email: "michael@mph.com", sessions: 25, rating: 5.0, avatar: "" },
  { id: 4, name: "Elena Rodriguez", role: "Cloud Architect", email: "elena@mph.com", sessions: 31, rating: 4.7, avatar: "" },
  { id: 5, name: "David Park", role: "Data Scientist", email: "david@mph.com", sessions: 19, rating: 4.9, avatar: "" },
];

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = TEACHERS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Faculty Directory</h1>
        <p className="text-muted-foreground text-lg">Manage and view all registered instructors in the MPH network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="group overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-md">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                  <Star className="mr-1 h-3 w-3 fill-current" /> {teacher.rating}
                </Badge>
              </div>
              <div className="mt-4">
                <CardTitle className="text-xl font-bold">{teacher.name}</CardTitle>
                <CardDescription className="text-primary font-medium mt-1">{teacher.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Sessions</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> {teacher.sessions}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</p>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shadow-none">Active</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-10 border-primary/10 hover:bg-primary/5">
                  <Mail className="mr-2 h-4 w-4 text-primary" /> Email
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-primary/5">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
