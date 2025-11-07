import Link from 'next/link';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

interface ChatLayoutProps {
  children: React.ReactNode;
  clinicName: string;
}

export default function ChatLayout({ children, clinicName }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="md:hidden">
              <Link href="/book">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">{clinicName}</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/book">
              <MessageSquare className="mr-2 h-4 w-4" />
              Book a Session
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow flex flex-col container mx-auto px-0 sm:px-6 lg:px-8 py-4">
        <div className="flex-grow flex flex-col bg-card rounded-lg border shadow-inner overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
