
import { getBooking, getClinicData } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, Calendar, Clock, User, MessageSquare, Sparkles, DollarSign, UserSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FirebaseClientProvider } from '@/firebase';

export default async function PassPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);
  const clinicData = await getClinicData();

  if (!booking || !clinicData) {
    notFound();
  }

  const service = clinicData.massageServices.find(
    (s) => s.id === booking.massageServiceId
  );
  
  const therapist = clinicData.staff.find(
    (t) => t.id === booking.staffId
  );

  if (!service || !therapist) {
    notFound();
  }

  const bookingTime = new Date(booking.bookingTime);

  return (
    <FirebaseClientProvider>
      <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
           <Card className="overflow-hidden shadow-lg relative bg-card">
              <CardHeader className="text-center bg-primary/10 p-6">
                  <div className="mx-auto w-fit mb-4">
                      <Ticket className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">Your Booking Pass</CardTitle>
                  <CardDescription>Thank you for booking with {clinicData.name}!</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                  <div className="space-y-2 text-center border-b pb-4 border-dashed">
                      <p className="text-lg font-semibold text-primary">{service.name}</p>
                      <p className="text-sm text-muted-foreground">({service.duration} minutes)</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                              <p className="text-xs text-muted-foreground">Name</p>
                              <p className="font-medium">{booking.name}</p>
                          </div>
                      </div>
                       <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <div>
                              <p className="text-xs text-muted-foreground">Price</p>
                              <p className="font-medium">${service.price}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium">{format(bookingTime, 'PPP')}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                              <p className="text-xs text-muted-foreground">Time</p>
                              <p className="font-medium">{format(bookingTime, 'p')}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 col-span-full">
                          <UserSquare className="h-5 w-5 text-muted-foreground" />
                          <div>
                              <p className="text-xs text-muted-foreground">Therapist</p>
                              <p className="font-medium">{therapist.name}</p>
                          </div>
                      </div>
                  </div>
                  <div className="pt-4 text-center text-xs text-muted-foreground">
                      <p>Please show this pass upon arrival.</p>
                      <p>{clinicData.address}</p>
                  </div>
              </CardContent>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-muted/40"></div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-8 h-8 rounded-full bg-muted/40"></div>
           </Card>
           <div className="mt-6 text-center">
              <Button asChild variant="outline">
                  <Link href="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Back to Chat
                  </Link>
              </Button>
           </div>
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
