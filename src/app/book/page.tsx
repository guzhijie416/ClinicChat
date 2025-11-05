
'use client';
import { getClinicData } from '@/lib/data';
import type { ClinicData } from '@/types';
import { useEffect, useState } from 'react';
import { BookingForm } from '@/components/booking/booking-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function BookPage() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getClinicData();
      setClinicData(data);
    }
    loadData();
  }, []);

  if (!clinicData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Book a Session</h1>
            <p className="text-muted-foreground">
              Select a service and time for your appointment.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <BookingForm clinicData={clinicData} />
      </div>
    </div>
  );
}
