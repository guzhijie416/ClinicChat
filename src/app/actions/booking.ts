
'use server';

import { z } from 'zod';
import { createBooking } from '@/lib/data';
import { redirect } from 'next/navigation';

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  massageServiceId: z.string().min(1, 'Please select a service.'),
  bookingTime: z.string().min(1, 'Please select a time.'),
});

export async function submitBooking(formData: unknown) {
  const validatedFields = bookingSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const booking = await createBooking(validatedFields.data);
    redirect(`/pass/${booking.id}`);
  } catch (error) {
    return {
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }
}
