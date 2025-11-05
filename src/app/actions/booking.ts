
'use server';

import { z } from 'zod';
import { createBooking, getBooking } from '@/lib/data';
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
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newBooking = await createBooking(validatedFields.data);
    // The redirect needs to be called outside of the try/catch block
    // as it works by throwing an error, which would be caught.
     if(newBooking){
        redirect(`/pass/${newBooking.id}`);
    }
  } catch (error) {
    return {
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }
  
  return {
      errors: { _form: ['Could not find booking to redirect.'] },
  }
}
