
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

  If the user's question is about "who is working", "who is available", "what is your schedule", or similar, you MUST generate a human-readable weekly schedule. Follow these steps precisely:
  1. The provided JSON has two keys: "staff" (an array of objects with id and name) and "schedule" (an object where keys are staff ids and values are arrays of day numbers).
  2. The schedule uses numbers for days: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 0=Sunday.
  3. Create a list for each day of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  4. For each day of the week, go through every person in the "staff" array.
  5. For each person, get their 'id'. Look up that 'id' in the "schedule" object.
  6. Check if the resulting schedule array contains the number for the current day you are processing.
  7. If it does, add that person's 'name' to the list for that day.
  8. After checking all staff for all days, format the result like the example below. If a day has no staff, state "No one scheduled".
  9. Your entire response should be ONLY this formatted schedule. Do not add any other text.
  
  Example output format:
  Here is our weekly schedule:
  - Monday: Dr. Evelyn Reed, Marco Jimenez
  - Tuesday: Dr. Evelyn Reed
  - Wednesday: No one scheduled
  - Thursday: Aisha Chen
  - Friday: Dr. Evelyn Reed, Marco Jimenez, Aisha Chen
  - Saturday: K.K.
  - Sunday: K.K.

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

