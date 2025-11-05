
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import type { ClinicData } from "@/types";
import { saveClinicData } from "@/app/actions/clinic";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { addMinutes, isAfter } from "date-fns";

const clinicFormSchema = z.object({
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


type ClinicFormValues = z.infer<typeof clinicFormSchema>;

interface ClinicFormProps {
  defaultValues: ClinicData;
}

let fieldIdCounter = 0;
const generateFieldId = () => `id-${Date.now()}-${fieldIdCounter++}`;

export function ClinicForm({ defaultValues }: ClinicFormProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      ...defaultValues,
      staff: defaultValues.staff?.map(s => ({...s, id: s.id || generateFieldId() })) || [],
      massageServices: defaultValues.massageServices?.map(s => ({...s, id: s.id || generateFieldId() })) || [],
      sessions: defaultValues.sessions?.map(s => ({...s, id: s.id || generateFieldId() })) || [],
      faq: defaultValues.faq?.map(f => ({...f, id: f.id || generateFieldId() })) || [],
    },
  });
  
  const { fields: staffFields, append: appendStaff, remove: removeStaff } = useFieldArray({
    control: form.control,
    name: "staff",
  });
  
  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "massageServices",
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({
    control: form.control,
    name: "sessions",
  });

  const massageServices = form.watch('massageServices');

  const onSubmit = async (data: ClinicFormValues) => {
    const result = await saveClinicData(data);
    if (result.success) {
      toast({
        title: "Success!",
        description: "Clinic information has been updated.",
      });
    } else {
      console.log(result.errors);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update information. Please check the form for errors.",
      });
    }
  };

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentSessions = form.getValues("sessions");
      const activeSessions = currentSessions.filter(session => {
        const service = massageServices.find(s => s.id === session.massageServiceId);
        if (!service || !session.startTime) return false;
        try {
          const startTime = new Date(session.startTime);
          const endTime = addMinutes(startTime, service.duration);
          return isAfter(endTime, now);
        } catch (e) {
          return false;
        }
      });
      if (activeSessions.length < currentSessions.length) {
        form.setValue("sessions", activeSessions, { shouldDirty: true });
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [form, massageServices, isClient]);


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
            <CardTitle>Therapists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`staff.${index}.name`} render={({ field }) => (
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
            <Button type="button" variant="outline" size="sm" onClick={() => appendStaff({ id: generateFieldId(), name: "" })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Therapist
            </Button>
          </CardContent>
        </Card>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Massage Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {serviceFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)} className="absolute top-2 right-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name={`massageServices.${index}.name`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Swedish Massage" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name={`massageServices.${index}.duration`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name={`massageServices.${index}.price`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => appendService({ id: generateFieldId(), name: "", duration: 60, price: 70 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Therapist Schedule</CardTitle>
            <FormDescription>Add current sessions to mark therapists as busy. Sessions will be automatically removed after they finish.</FormDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isClient && sessionFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name={`sessions.${index}.staffId`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Therapist</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a therapist" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch('staff').map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`sessions.${index}.massageServiceId`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Massage Service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {massageServices.map(service => (
                            <SelectItem key={service.id} value={service.id}>{service.name} ({service.duration} min)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`sessions.${index}.startTime`} render={({ field }) => (
                     <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeSession(index)} className="absolute top-2 right-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const now = new Date();
                  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                  const startTime = now.toISOString().slice(0,16);

                  appendSession({ 
                    id: generateFieldId(), 
                    staffId: "", 
                    massageServiceId: "", 
                    startTime: startTime
                  })
                }}
                disabled={form.watch('staff').length === 0 || massageServices.length === 0}
              >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Session
            </Button>
            {form.watch('staff').length === 0 && <p className="text-sm text-muted-foreground">Please add a therapist before adding a session.</p>}
            {massageServices.length === 0 && <p className="text-sm text-muted-foreground">Please add a massage service before adding a session.</p>}
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
             <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ id: generateFieldId(), question: "", answer: "" })}>
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
