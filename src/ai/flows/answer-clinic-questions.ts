
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

  CONTEXT:
  - The clinic's name is {{{clinicName}}}.
  - Address: {{{clinicAddress}}}
  - Phone: {{{clinicPhone}}}
  - Hours: {{{clinicHours}}}
  
  STAFF & SCHEDULE JSON:
  {{{staffAndSchedule}}}
  
  FAQ:
  {{{faq}}}

  If the user's question is about "who is working", "who is available", "what is your schedule", or similar, you MUST follow these steps to construct the response:
  1. Parse the STAFF & SCHEDULE JSON. It contains a 'staff' array and a 'schedule' object. The schedule object uses staff IDs as keys.
  2. Create a schedule for each day of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  3. You are given this mapping of day numbers to day names: 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday.
  4. For each staff member in the 'staff' array, get their 'id' and 'name'.
  5. Use the staff member's 'id' to find their schedule in the 'schedule' object. The schedule is an array of day numbers.
  6. For each day number in that staff member's schedule, find the corresponding day name from your mapping. Add the staff member's 'name' to that day's schedule list.
  7. After checking all staff members, format the final output as a simple list, with the day of the week followed by the names of the staff working on that day. If no one is scheduled for a day, state that clearly (e.g., "No one scheduled").
  8. Your final response should start with "Here is our weekly schedule:" and be followed by the list you generated. Do not output the raw JSON.

  Example Output:
  Here is our weekly schedule:
  - Monday: Dr. Evelyn Reed, Marco Jimenez
  - Tuesday: Dr. Evelyn Reed, Marco Jimenez
  - Wednesday: Dr. Evelyn Reed, Marco Jimenez
  - Thursday: Dr. Evelyn Reed, Marco Jimenez
  - Friday: Dr. Evelyn Reed, Marco Jimenez
  - Saturday: Aisha Chen
  - Sunday: Aisha Chen

  If the user asks about booking an appointment, wanting to schedule a session, or something similar, your answer should be: "You can book a session by going to our booking page: /book"

  For all other questions, use the provided context and FAQ to answer the user's question.

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
