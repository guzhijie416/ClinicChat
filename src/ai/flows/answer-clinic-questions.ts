
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
  prompt: `You are a helpful AI assistant for a specific clinic. Your task is to answer user questions ONLY based on the provided information for that clinic.

  - If the user asks a general health or wellness question that CANNOT be answered using the provided context, respond with ONLY the phrase: "I cannot answer this".
  - If the user wants to book an appointment, schedule a session, or something similar, respond with 'You can book a session by going to our booking page: /book'.
  - If the user is asking "who is working", "who is available", or about schedules, use the provided STAFF & SCHEDULE JSON to create and list the weekly schedule.
      - Create a mapping of day numbers to day names: 0: Sunday, 1: Monday, etc.
      - For each day of the week, list the staff members working.
      - Format the output starting with "Here is our weekly schedule:". For each day, list the day (in bold using **Day**) and the names of staff working. If no one is working, state that.
  - For all other questions, use the provided CONTEXT and FAQ to give a helpful answer.

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
