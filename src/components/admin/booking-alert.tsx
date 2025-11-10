
'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { Booking } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { X, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const NOTIFICATION_SOUND = '/desk-bell.mp3';

export function BookingAlert() {
  const { firestore } = useFirebase();
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [lastDismissedTime, setLastDismissedTime] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('lastDismissedBookingTime') || '0', 10);
  });
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Audio needs to be created on the client side
    setAudio(new Audio(NOTIFICATION_SOUND));
  }, []);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const today = Timestamp.fromMillis(lastDismissedTime);
    return query(
      collection(firestore, 'bookings'),
      where('bookingTime', '>', today.toDate().toISOString())
    );
  }, [firestore, lastDismissedTime]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const newBooking = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    // Find the most recent booking that hasn't been dismissed
    const sorted = [...bookings].sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime());
    return sorted[0];
  }, [bookings]);

  useEffect(() => {
    if (newBooking) {
      const bookingTime = new Date(newBooking.bookingTime).getTime();
      if (bookingTime > lastDismissedTime) {
        setShowNewBooking(true);
        audio?.play().catch(e => console.error("Audio playback failed. User interaction may be required.", e));
      }
    }
  }, [newBooking, lastDismissedTime, audio]);

  const handleDismiss = () => {
    if (newBooking) {
      const bookingTime = new Date(newBooking.bookingTime).getTime();
      localStorage.setItem('lastDismissedBookingTime', bookingTime.toString());
      setLastDismissedTime(bookingTime);
    }
    setShowNewBooking(false);
  };

  if (!showNewBooking || !newBooking) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-pulse-slow">
      <Card className="border-red-500 border-2 shadow-2xl bg-red-50 dark:bg-red-900/20">
        <CardHeader className="p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-red-600">New Booking!</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-red-500">
            A new appointment has been created.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-4 p-3 bg-red-100/50 dark:bg-red-900/30 rounded-lg">
            <div className="flex-shrink-0">
              <Ticket className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-grow">
              <p className="font-semibold">{newBooking.name}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(newBooking.bookingTime), 'PPP p')}</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/pass/${newBooking.id}`}>View Pass</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add the animation to tailwind.config.ts if it doesn't exist
// keyframes: {
//   'pulse-slow': {
//     '0%, 100%': { opacity: 1, transform: 'scale(1)' },
//     '50%': { opacity: 0.9, transform: 'scale(1.02)' },
//   }
// },
// animation: {
//  'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
// }
