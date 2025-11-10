import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, QrCode, MessageSquare, Settings, CalendarCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { BookingAlert } from '@/components/admin/booking-alert';
import { FirebaseClientProvider } from '@/firebase';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <div className="flex flex-col min-h-screen">
        <BookingAlert />
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">ClinicChat</h1>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              Manage Clinic
            </Link>
          </Button>
        </header>

        <main className="flex-grow">
          <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-6xl font-bold font-headline text-foreground tracking-tight">
                An AI Assistant For Your Clinic.
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                ClinicChat is an AI-powered assistant that answers client questions about your services, availability, and more, 24/7.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/chat">
                    Chat with the Assistant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/book">
                    Book a Session
                    <CalendarCheck className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="bg-card py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold font-headline">How It Works</h3>
                <p className="mt-2 text-muted-foreground">A simple process to connect clients with information.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">1. Scan QR Code</h4>
                  <p className="text-muted-foreground">Clients scan a unique QR code at your clinic, which instantly opens the chat interface on their phone.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">2. Start Chatting</h4>
                  <p className="text-muted-foreground">The AI assistant greets them and is ready to answer questions about your business, staff, and services.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Settings className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">3. You're in Control</h4>
                  <p className="text-muted-foreground">Easily update your clinic's information, including staff availability and FAQs, through a simple admin panel.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ClinicChat. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </FirebaseClientProvider>
  );
}