
'use client';
import type { ClinicData, Staff } from '@/types';
import { useEffect, useState } from 'react';
import { BookingForm } from '@/components/booking/booking-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare } from 'lucide-react';
import { getClinicDataForClient } from '@/app/actions/data';
import { FirebaseClientProvider } from '@/firebase';


export default function BookPage() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getClinicDataForClient();
      setClinicData(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading || !clinicData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <FirebaseClientProvider>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-headline">Book a Session</h1>
              <p className="text-muted-foreground">
                Select a service and time for your appointment.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Back to Chat
                </Link>
              </Button>
            </div>
          </div>
          <BookingForm clinicData={clinicData} />
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
