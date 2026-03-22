import './globals.css';
import Navbar from '@/components/Navbar'; // <-- Import your new component here

export const metadata = {
  title: 'Digital Heroes | Golf Charity Platform',
  description: 'A subscription-based golf platform combining performance tracking and charitable giving.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased flex flex-col min-h-screen">
        
        {/* Global Public Navbar injected here */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            &copy; 2026 Impact Golf Charity Platform. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}