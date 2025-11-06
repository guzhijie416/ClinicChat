
'use server';

/**
 * @fileOverview A flow that answers questions about a clinic using data from Firestore and open sources.
 *
 * - answerClinicQuestions - A function that answers questions about the clinic.
 * - AnswerClinicQuestionsInput - The input type for the answerClinicQuestions function.
 * - AnswerClinicQuestionsOutput - The return type for the answerClinicQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerClinicQuestionsInputSchema = z.object({
  question: z.string().describe('The question to ask about the clinic.'),
  clinicName: z.string().describe('The name of the clinic.'),
  clinicAddress: z.string().describe('The address of the clinic.'),
  clinicHours: z.string().describe('The hours of operation of the clinic.'),
  clinicPhone: z.string().describe('The phone number of the clinic.'),
  staffAndSchedule: z.string().describe('A JSON string representing all staff members and their weekly schedules.'),
  faq: z.string().describe('Frequently asked questions about the clinic.'),
});
export type AnswerClinicQuestionsInput = z.infer<typeof AnswerClinicQuestionsInputSchema>;

const AnswerClinicQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the clinic.'),
});
export type AnswerClinicQuestionsOutput = z.infer<typeof AnswerClinicQuestionsOutputSchema>;

export async function answerClinicQuestions(input: AnswerClinicQuestionsInput): Promise<AnswerClinicQuestionsOutput> {
  return answerClinicQuestionsFlow(input);
}

const answerClinicQuestionsPrompt = ai.definePrompt({
  name: 'answerClinicQuestionsPrompt',
  input: {schema: AnswerClinicQuestionsInputSchema},
  output: {schema: AnswerClinicQuestionsOutputSchema},
  prompt: `You are a helpful AI assistant for a clinic. Your task is to answer user questions based on the provided information.

  1.  **Booking Intent:** If the user wants to book an appointment, schedule a session, or something similar, respond with 'You can book a session by going to our booking page: /book'.

  2.  **Schedule Intent:** If the user is asking "who is working", "who is available", or about schedules:
      -   Parse the STAFF & SCHEDULE JSON. It has a 'staff' array and a 'schedule' object. The 'schedule' object keys are staff IDs, and values are arrays of day numbers (0-6, where 0 is Sunday).
      -   Create a mapping of day numbers to day names: 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday.
      -   Initialize a schedule for the week (e.g., { Monday: [], Tuesday: [], ... }).
      -   Iterate through each staff member. For their 'id', find their working days in the 'schedule' object.
      -   For each working day, add the staff member's 'name' to that day's list.
      -   Format the output starting with "Here is our weekly schedule:". For each day, list the day (in bold using **Day**) and the names of staff working. If no one is working, state that.
      
  3.  **General Questions:** For all other questions, use the provided context and FAQ to give a helpful answer.
      
  CONTEXT:
  - Clinic: {{{clinicName}}} at {{{clinicAddress}}}
  - Phone: {{{clinicPhone}}}
  - Hours: {{{clinicHours}}}
  - Staff & Schedule JSON: {{{staffAndSchedule}}}
  - FAQ: {{{faq}}}

  Question: {{{question}}}`,
});

const answerClinicQuestionsFlow = ai.defineFlow(
  {
    name: 'answerClinicQuestionsFlow',
    inputSchema: AnswerClinicQuestionsInputSchema,
    outputSchema: AnswerClinicQuestionsOutputSchema,
  },
  async input => {
    const {output} = await answerClinicQuestionsPrompt(input);
    return output!;
  }
);
