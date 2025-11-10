import { getClinicData, getAllBookings } from "@/lib/data";
import { ClinicForm } from "@/components/admin/clinic-form";
import { Button } from "@/components/ui/button";
import { Home, Ticket } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsList } from "@/components/admin/bookings-list";
import { Separator } from "@/components/ui/separator";
import { QRCodeCard } from "@/components/admin/qr-code-card";
import { format } from "date-fns";
import { FirebaseClientProvider } from "@/firebase";
import { DailyReport } from "@/components/admin/daily-report";
import { BookingAlert } from "@/components/admin/booking-alert";

export default async function AdminPage() {
  const clinicData = await getClinicData();
  const bookings = await getAllBookings();

  return (
    <FirebaseClientProvider>
      <BookingAlert />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your clinic's information and view bookings.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <BookingsList bookings={bookings} clinicData={clinicData} />
              <DailyReport clinicData={clinicData} />
            </div>
            <div className="space-y-8">
              <QRCodeCard />
              {bookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Alerts</CardTitle>
                    <CardDescription>New appointments for today and the future.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bookings.map(booking => {
                      const service = clinicData.massageServices.find(s => s.id === booking.massageServiceId);
                      const bookingTime = new Date(booking.bookingTime);
                      return (
                        <div key={booking.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Ticket className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold">{booking.name}</p>
                            <p className="text-sm text-muted-foreground">{service?.name || 'Unknown Service'}</p>
                            <p className="text-xs text-muted-foreground">{format(bookingTime, 'PPP p')}</p>
                          </div>
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/pass/${booking.id}`}>View Pass</Link>
                          </Button>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>


          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>This information will be used by the AI to answer client questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClinicForm defaultValues={clinicData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </FirebaseClientProvider>
  );
}
