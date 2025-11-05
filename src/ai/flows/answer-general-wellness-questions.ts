'use server';

/**
 * @fileOverview Responds to general health and wellness questions using open-source knowledge.
 *
 * - answerGeneralWellnessQuestion - A function that answers general health and wellness questions.
 * - AnswerGeneralWellnessQuestionInput - The input type for the answerGeneralWellnessQuestion function.
 * - AnswerGeneralWellnessQuestionOutput - The return type for the answerGeneralWellnessQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGeneralWellnessQuestionInputSchema = z.object({
  question: z.string().describe('The general health and wellness question to answer.'),
});
export type AnswerGeneralWellnessQuestionInput = z.infer<typeof AnswerGeneralWellnessQuestionInputSchema>;

const AnswerGeneralWellnessQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AnswerGeneralWellnessQuestionOutput = z.infer<typeof AnswerGeneralWellnessQuestionOutputSchema>;

export async function answerGeneralWellnessQuestion(input: AnswerGeneralWellnessQuestionInput): Promise<AnswerGeneralWellnessQuestionOutput> {
  return answerGeneralWellnessQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGeneralWellnessQuestionPrompt',
  input: {schema: AnswerGeneralWellnessQuestionInputSchema},
  output: {schema: AnswerGeneralWellnessQuestionOutputSchema},
  prompt: `You are a helpful AI assistant that answers general health and wellness questions using open-source knowledge.

  Question: {{{question}}}
  `,
});

const answerGeneralWellnessQuestionFlow = ai.defineFlow(
  {
    name: 'answerGeneralWellnessQuestionFlow',
    inputSchema: AnswerGeneralWellnessQuestionInputSchema,
    outputSchema: AnswerGeneralWellnessQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
