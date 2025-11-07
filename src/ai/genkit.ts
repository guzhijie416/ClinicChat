import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyDP_41SccJtrQMbwjanaUhcQUGFCrrGXOk'})],
  model: 'googleai/gemini-2.5-flash',
});
