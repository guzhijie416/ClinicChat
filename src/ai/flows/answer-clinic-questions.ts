
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
  staffAndSchedule: z.string().describe('A JSON string representing all staff members and their weekly schedules. The schedule is a list of numbers where 0=Sunday, 1=Monday, ..., 6=Saturday.'),
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

  If the user's question is about "who is working", "who is available", "what is your schedule", or similar, you MUST use the provided "STAFF & SCHEDULE JSON" to generate a human-readable weekly schedule. Follow these steps:
  1. Create a list for each day of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  2. The schedule in the JSON uses numbers for days: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 0=Sunday.
  3. For each person in the 'staff' array, check their 'id' against the 'schedule' object.
  4. For each day of the week, list the names of the staff members who are scheduled to work. If no one is scheduled, state that.
  5. Your entire response should be ONLY this formatted schedule. Do not add any other text.
  
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
