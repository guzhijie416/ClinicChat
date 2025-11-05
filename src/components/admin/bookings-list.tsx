
import type { Booking, ClinicData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { CalendarCheck, User, Sparkles, Clock } from "lucide-react";

interface BookingsListProps {
  bookings: Booking[];
  clinicData: ClinicData;
}

export function BookingsList({ bookings, clinicData }: BookingsListProps) {

  const getBookingDetails = (booking: Booking) => {
    const service = clinicData.massageServices.find(s => s.id === booking.massageServiceId);
    const therapist = clinicData.staff.find(t => t.id === booking.staffId);
    return { service, therapist };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bookings</CardTitle>
        <CardDescription>A list of all client appointments.</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead className="text-right">Appointment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const { service, therapist } = getBookingDetails(booking);
                const bookingTime = new Date(booking.bookingTime);
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>{service?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{therapist?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex flex-col items-end">
                         <span>{format(bookingTime, 'PPP')}</span>
                         <span className="text-muted-foreground text-xs">{format(bookingTime, 'p')}</span>
                       </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Bookings Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              New bookings will appear here as clients create them.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
