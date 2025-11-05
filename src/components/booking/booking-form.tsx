
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
import type { ClinicData } from '@/types';
import { submitBooking } from '@/app/actions/booking';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';

const bookingFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  massageServiceId: z.string().min(1, 'Please select a service.'),
  bookingTime: z.string().min(1, 'Please select a time.'),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  clinicData: ClinicData;
}

export function BookingForm({ clinicData }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      massageServiceId: '',
      bookingTime: '',
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await submitBooking(formData);

      if (result?.errors) {
        // Handle errors if needed, e.g., show a toast
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: "Please check your input and try again.",
        });
      }
      // A successful submission will automatically redirect due to the server action,
      // so no success handling is needed here.
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <FormLabel>Preferred Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? 'Generating Pass...' : 'Get Your Pass'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
