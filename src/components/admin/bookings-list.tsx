
'use client';

import type { Booking, ClinicData } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { CalendarCheck, User, Sparkles, Clock, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { deleteBooking } from "@/app/actions/booking";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingsListProps {
  bookings: Booking[];
  clinicData: ClinicData;
}

export function BookingsList({ bookings, clinicData }: BookingsListProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getBookingDetails = (booking: Booking) => {
    const service = clinicData.massageServices.find(s => s.id === booking.massageServiceId);
    const therapist = clinicData.staff.find(t => t.id === booking.staffId);
    return { service, therapist };
  }

  const handleDelete = (bookingId: string) => {
    startTransition(async () => {
      const result = await deleteBooking(bookingId);
      if (result.success) {
        toast({ title: "Booking Deleted", description: "The appointment has been removed." });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
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
                <TableHead>Appointment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>
                       <div className="flex flex-col">
                         <span>{format(bookingTime, 'PPP')}</span>
                         <span className="text-muted-foreground text-xs">{format(bookingTime, 'p')}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" disabled={isPending}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the booking
                                and free up the therapist's time slot.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(booking.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
