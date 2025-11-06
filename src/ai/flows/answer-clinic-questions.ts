
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
  
  STAFF & SCHEDULE:
  - The following JSON data contains a 'staff' array and a 'schedule' object.
  - Staff and Schedule Data: {{{staffAndSchedule}}}
  - The schedule uses numbers for days of the week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.

  If the user asks "who is working", "who is available", or asks about the schedule, you MUST respond by presenting the entire weekly schedule. To do this, you must:
  1. Iterate through each person in the 'staff' array.
  2. For each person, use their 'id' to look up their list of working day numbers in the 'schedule' object.
  3. Convert the day numbers into day names using the map provided above (e.g., 1 becomes "Monday").
  4. Format the output clearly as a list. For example: "Here is our weekly schedule:\n- Dr. Evelyn Reed: Monday, Tuesday, Wednesday\n- Marco Jimenez: Thursday, Friday".
  5. If a staff member has an empty array for their schedule, you should state "No scheduled days".

  FAQ:
  {{{faq}}}

  If the user asks about booking an appointment, wanting to schedule a session, or something similar, your answer should be: "You can book a session by going to our booking page: /book"

  Based on all of the above information, please answer the following question.

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
