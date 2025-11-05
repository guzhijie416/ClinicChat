
'use server';

import { z } from 'zod';
import { createBooking } from '@/lib/data';
import { redirect } from 'next/navigation';

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  massageServiceId: z.string().min(1, 'Please select a service.'),
  bookingTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid booking time is required."
  }),
});

export async function submitBooking(data: unknown) {
  const validatedFields = bookingSchema.safeParse(data);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const booking = await createBooking(validatedFields.data);
    // The redirect needs to be called outside of the try/catch block
    // as it works by throwing an error, which would be caught.
  } catch (error) {
    return {
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }

  // Find the created booking to get the ID for redirection
  const bookings = await (await import('@/lib/data')).getBooking(undefined, validatedFields.data);
  const newBooking = bookings[bookings.length -1];
  if(newBooking){
      redirect(`/pass/${newBooking.id}`);
  }
  
  return {
      errors: { _form: ['Could not find booking to redirect.'] },
  }
}
