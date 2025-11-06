
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
  1. Parse the STAFF & SCHEDULE JSON. It has a 'staff' array and a 'schedule' object. The 'schedule' object's keys are staff IDs, and the values are arrays of day numbers they work.
  2. Create a mapping of day numbers to day names: 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday.
  3. Create a data structure that will hold the final schedule for each day, like: { Monday: [], Tuesday: [], ... }.
  4. Iterate through each staff member in the 'staff' array. For each member, get their 'id' and 'name'.
  5. Use the staff member's 'id' to look up their schedule in the 'schedule' object. This will give you an array of day numbers they work.
  6. For each day number in their schedule, find the corresponding day name from your map and add the staff member's 'name' to that day's list in your final schedule data structure.
  7. After processing all staff, format the final output as a list. Start with "Here is our weekly schedule:".
  8. For each day of the week from Monday to Sunday, list the names of the staff working.
  9. If no one is scheduled for a day, state that clearly (e.g., "No one scheduled").
  10. IMPORTANT: When listing the day of the week, wrap it in double asterisks, like **Monday**.

  Example Output:
  Here is our weekly schedule:
  - **Monday**: Dr. Evelyn Reed, Marco Jimenez
  - **Tuesday**: Dr. Evelyn Reed, Marco Jimenez
  - **Wednesday**: No one scheduled
  - **Thursday**: Aisha Chen
  - **Friday**: Aisha Chen
  - **Saturday**: K.K. 
  - **Sunday**: K.K.

  If the user asks about booking an appointment, wanting to schedule a session, or something similar, your answer should be: "You can book a session now. [ACTION:BOOK_NOW]"

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
