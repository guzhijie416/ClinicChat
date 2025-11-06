
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ClinicData, Staff } from '@/types';
import { submitBooking } from '@/app/actions/booking';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useState, useEffect, useMemo } from 'react';
import { getAvailableStaffForClient } from '@/app/actions/data';

const bookingFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  massageServiceId: z.string().min(1, 'Please select a service.'),
  staffId: z.string().min(1, 'Please select a therapist.'),
  bookingTime: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "A valid booking time is required."
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  clinicData: ClinicData;
}

export function BookingForm({ clinicData }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      massageServiceId: '',
      staffId: '',
      bookingTime: '',
    },
  });

  const selectedBookingTime = form.watch('bookingTime');

  useEffect(() => {
    async function fetchStaff() {
      if (!selectedBookingTime) {
        setAvailableStaff([]);
        return;
      }
      setIsFetchingStaff(true);
      try {
        const staff = await getAvailableStaffForClient(new Date(selectedBookingTime));
        setAvailableStaff(staff);
      } catch (error) {
        console.error("Failed to fetch available staff", error);
        setAvailableStaff([]);
      } finally {
        setIsFetchingStaff(false);
      }
    }

    // When the booking time changes, refetch the available staff
    fetchStaff();
  }, [selectedBookingTime]);


  const onSubmit = (data: BookingFormValues) => {
    startTransition(async () => {
      const result = await submitBooking(data);

      if (result?.errors) {
        const errorMessages = Object.values(result.errors).flat().join(' ');
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: errorMessages || "Please check your input and try again.",
        });
      }
    });
  };

  const isButtonDisabled = useMemo(() => {
    return isPending || isFetchingStaff || !selectedBookingTime || availableStaff.length === 0
  }, [isPending, isFetchingStaff, selectedBookingTime, availableStaff.length]);


  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="massageServiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a massage service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clinicData.massageServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min) - $
                          {service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapist</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedBookingTime || isFetchingStaff}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedBookingTime ? "Please select a time first" : (isFetchingStaff ? "Finding therapists..." : "Select an available therapist")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!isFetchingStaff && availableStaff.length > 0 ? availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      )) : <SelectItem value="no-one" disabled>
                          {!selectedBookingTime ? "Select a date to see availability" : "No therapists available for this time"}
                        </SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full"
            >
              {isPending ? 'Generating Pass...' : 'Get Your Pass'}
            </Button>
          </CardFooter>
      </Card>
      </form>
    </Form>
  );
}
