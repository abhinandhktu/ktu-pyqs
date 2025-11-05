
import React from 'react';
import { Button } from '@/components/ui/button';
import { Notebook, History } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-black bg-background py-2 px-4 md:px-8">
      <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <div className="flex items-center justify-center">
            <img
              src="/shrlogo.png"
              alt="Logo"
              width="100"
              height="40"
              className="mb-2"
            />
          </div>
        </Link>
        <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="outline" className="rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px active:neo-brutal-shadow-none font-semibold">
                <Notebook className="mr-2 h-4 w-4" />
                Notes
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" className="rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px activeL:neo-brutal-shadow-none font-semibold">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
        </div>
      </div>
    </nav>
  );
}
