"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateClinicData } from "@/lib/data";

const clinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required."),
  address: z.string().min(1, "Address is required."),
  hours: z.string().min(1, "Hours are required."),
  phone: z.string().min(1, "Phone number is required."),
  availableStaff: z.array(z.object({ name: z.string().min(1, "Staff name cannot be empty.") })),
  faq: z.array(z.object({
    question: z.string().min(1, "FAQ question cannot be empty."),
    answer: z.string().min(1, "FAQ answer cannot be empty."),
  })),
});

export async function saveClinicData(formData: unknown) {
  const validatedFields = clinicSchema.safeParse(formData);

  if (!validatedFields.success) {
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
