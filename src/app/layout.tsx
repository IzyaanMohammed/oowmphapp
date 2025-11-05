import React from 'react';
import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";


export const metadata: Metadata = {
  title: 'MPH Booking Central',
  description: 'Session booking and management for MPH.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoginPage = React.Children.toArray(children).some((child: any) => {
    // A bit of a hack, but there's no great way to detect the route from a layout in Next 13+ App router
    // This will break if the login page component name changes or is wrapped
    return child.type?.name === 'LoginPage' || child.props?.childProp?.segment === 'login';
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <FirebaseClientProvider>
           {isLoginPage ? (
              children
            ) : (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <div className="flex h-screen flex-col">
                  <main className="flex-1 overflow-y-auto">
                    {children}
                  </main>
                </div>
              </SidebarInset>
            </SidebarProvider>
          )}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
