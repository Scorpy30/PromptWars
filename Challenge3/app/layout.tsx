import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoTrack Pro - Carbon Footprint Accounting & Mitigation Platform',
  description: 'Track your personal carbon footprint, complete gamified daily environmental goals, and receive personalized mitigation strategies using AI recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
