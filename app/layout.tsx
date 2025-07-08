import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Price Comparison Tool',
  description: 'Find the best prices for your products across multiple retailers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
} 
