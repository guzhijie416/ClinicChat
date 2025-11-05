
'use server';

import { z } from 'zod';
import { createBooking } from '@/lib/data';
import { redirect } from 'next/navigation';

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  massageServiceId: z.string().min(1, 'Please select a service.'),
  staffId: z.string().min(1, 'Please select a therapist.'),
  bookingTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid booking time is required."
  }),
});

export async function submitBooking(data: unknown) {
  const validatedFields = bookingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const newBooking = await createBooking(validatedFields.data);
    // The redirect needs to be called outside of the try/catch block
    // as it works by throwing an error, which would be caught.
    if (newBooking) {
      redirect(`/pass/${newBooking.id}`);
    }
  } catch (error) {
    console.error(error);
    return {
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }
  
  // This will only be reached if the booking wasn't created for some reason
  return {
      errors: { _form: ['Could not create booking.'] },
  }
}
