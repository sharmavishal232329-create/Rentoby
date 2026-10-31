import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/context/AuthContext';
import { LocationProvider } from '@/components/context/LocationContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Rentoby — Rent Anything. Book Local Services. Right Nearby.',
  description:
    'Rent useful items and hire verified local service providers right in your neighborhood. Discover tractors, cameras, tools, camping equipment, and trusted local pros.',
  keywords: [
    'rentals',
    'equipment rental',
    'tractor rental',
    'agriculture machinery rental',
    'camera rental',
    'local services',
    'hyperlocal marketplace',
    'rent tools',
    'Rentoby',
  ],
  openGraph: {
    title: 'Rentoby — Rent Anything. Book Local Services. Right Nearby.',
    description:
      'Hyperlocal commercial marketplace for item rentals and trusted local services.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
