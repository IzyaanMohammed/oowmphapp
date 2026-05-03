import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';
import { Inter, PT_Sans, Shadows_Into_Light } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const shadowsIntoLight = Shadows_Into_Light({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-shadows-into-light',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MPH Booking Central',
  description: 'Session booking and management for MPH.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ptSans.variable} ${shadowsIntoLight.variable} font-body antialiased min-h-screen bg-background`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
