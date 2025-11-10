
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import type { Booking } from '@/types';
import { getAllBookingsForClient } from '@/app/actions/data';
import Link from 'next/link';

export function BookingAlert() {
  const [newBookings, setNewBookings] = useState<Booking[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to safely access localStorage
  const getDismissedBookings = (): string[] => {
    if (typeof window === 'undefined') return [];
    const dismissed = localStorage.getItem('dismissedBookings');
    return dismissed ? JSON.parse(dismissed) : [];
  };

  const addDismissedBooking = (bookingId: string) => {
    if (typeof window === 'undefined') return;
    const dismissed = getDismissedBookings();
    localStorage.setItem('dismissedBookings', JSON.stringify([...dismissed, bookingId]));
  };

  useEffect(() => {
    // Set up the audio element on the client side
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://cdn.freesound.org/previews/253/253177_4243697-lq.mp3');
      audioRef.current.preload = 'auto';
    }

    const fetchBookings = async () => {
      try {
        const allBookings = await getAllBookingsForClient();
        const dismissedIds = getDismissedBookings();
        const latestBooking = allBookings.length > 0 ? allBookings[allBookings.length - 1] : null;

        if (latestBooking && !dismissedIds.includes(latestBooking.id)) {
          setNewBookings([latestBooking]);
          audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
            // If no new booking or the latest is already dismissed, clear the alert.
            setNewBookings([]);
        }
      } catch (error) {
        console.error("Failed to fetch bookings for alert:", error);
      }
    };
    
    // Check immediately and then every 10 seconds
    fetchBookings();
    const intervalId = setInterval(fetchBookings, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDismiss = (bookingId: string) => {
    addDismissedBooking(bookingId);
    setNewBookings(newBookings.filter(b => b.id !== bookingId));
  };

  if (newBookings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      {newBookings.map((booking) => (
        <Card key={booking.id} className="bg-red-500 text-white border-red-600 shadow-2xl animate-pulse">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6" />
                <CardTitle>New Booking!</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-red-600 hover:text-white"
                onClick={() => handleDismiss(booking.id)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              New appointment for <span className="font-bold">{booking.name}</span>!
            </p>
            <div className="flex gap-2">
                <Button asChild className="w-full bg-white text-red-500 hover:bg-gray-100">
                    <Link href={`/pass/${booking.id}`} target="_blank" rel="noopener noreferrer">
                        View Pass
                    </Link>
                </Button>
                <Button className="w-full" variant="outline" onClick={() => handleDismiss(booking.id)}>
                    Dismiss
                </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
