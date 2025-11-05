"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import type { ClinicData } from "@/types";
import { saveClinicData } from "@/app/actions/clinic";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const clinicFormSchema = z.object({
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

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

interface ClinicFormProps {
  defaultValues: ClinicData;
}

export function ClinicForm({ defaultValues }: ClinicFormProps) {
  const { toast } = useToast();
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues,
  });
  
  const { fields: staffFields, append: appendStaff, remove: removeStaff } = useFieldArray({
    control: form.control,
    name: "availableStaff",
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  const onSubmit = async (data: ClinicFormValues) => {
    const result = await saveClinicData(data);
    if (result.success) {
      toast({
        title: "Success!",
        description: "Clinic information has been updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update information. Please check the form for errors.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="hours" render={({ field }) => (
            <FormItem>
              <FormLabel>Business Hours</FormLabel>
              <FormControl><Textarea {...field} placeholder="e.g., Mon-Fri: 9am - 5pm" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>Available Staff Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`availableStaff.${index}.name`} render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl><Input {...field} placeholder="Staff member's name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStaff(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendStaff({ name: "" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Staff Member
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
           <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqFields.map((field, index) => (
              <div key={field.id} className="space-y-2 p-4 border rounded-lg relative">
                 <FormField control={form.control} name={`faq.${index}.question`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl><Input {...field} placeholder="Frequently asked question" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name={`faq.${index}.answer`} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Answer to the question" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(index)} className="absolute top-2 right-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: "", answer: "" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
