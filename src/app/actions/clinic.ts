
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateClinicData } from "@/lib/data";

const clinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required."),
  address: z.string().min(1, "Address is required."),
  hours: z.string().min(1, "Hours are required."),
  phone: z.string().min(1, "Phone number is required."),
  staff: z.array(z.object({ 
    id: z.string(),
    name: z.string().min(1, "Staff name cannot be empty.") 
  })),
  massageServices: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Service name cannot be empty."),
    duration: z.coerce.number().min(1, "Duration must be positive."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
  })),
  sessions: z.array(z.object({
    id: z.string(),
    staffId: z.string().min(1, "Therapist is required."),
    massageServiceId: z.string().min(1, "Massage service is required."),
    startTime: z.string().min(1, "Start time is required."),
  })),
  faq: z.array(z.object({
    id: z.string().optional(),
    question: z.string().min(1, "FAQ question cannot be empty."),
    answer: z.string().min(1, "FAQ answer cannot be empty."),
  })),
});

export async function saveClinicData(formData: unknown) {
  const validatedFields = clinicSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateClinicData(validatedFields.data);
    revalidatePath('/admin');
    revalidatePath('/chat');
    return { success: true };
  } catch (error) {
    return {
      errors: { _form: ["An unexpected error occurred."] }
    }
  }
}
