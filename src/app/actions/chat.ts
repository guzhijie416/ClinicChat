
"use server";

import { answerClinicQuestions } from '@/ai/flows/answer-clinic-questions';
import { answerGeneralWellnessQuestion } from '@/ai/flows/answer-general-wellness-questions';
import { getClinicData } from '@/lib/data';

export async function submitMessage(message: string): Promise<string> {
  if (!message.trim()) {
    return "Please enter a question.";
  }

  const clinicData = await getClinicData();
  const faqString = clinicData.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
  
  const staffAndSchedule = {
    staff: clinicData.staff,
    schedule: clinicData.weeklySchedule,
    sessions: clinicData.sessions
  };

  try {
    // First, try to answer using the clinic-specific knowledge.
    const clinicResponse = await answerClinicQuestions({
      question: message,
      clinicName: clinicData.name,
      clinicAddress: clinicData.address,
      clinicHours: clinicData.hours,
      clinicPhone: clinicData.phone,
      staffAndSchedule: JSON.stringify(staffAndSchedule, null, 2),
      faq: faqString,
    });
    
    // The AI will say "I cannot answer this" if it's a general question.
    // This is our cue to switch to the general wellness flow.
    if (!clinicResponse.answer.includes("I cannot answer this")) {
        return clinicResponse.answer;
    }
  } catch (error: any) {
     // This error often means the API key is missing.
     if (error.message && error.message.includes('API key not valid')) {
       return "I'm sorry, my connection to the AI service isn't configured correctly. The API key is missing or invalid. The clinic owner needs to configure this in the Firebase environment.";
     }
     // Fall through to the general wellness flow if there's another error.
  }
  
  // If the clinic-specific flow couldn't answer, try the general one.
  try {
    const generalResponse = await answerGeneralWellnessQuestion({ question: message });
    return generalResponse.answer;
  } catch (error: any) {
    console.error("Error calling AI flow:", error);
    if (error.message && error.message.includes('API key not valid')) {
         return "I'm sorry, my connection to the AI service isn't configured correctly. The API key is missing or invalid. The clinic owner needs to configure this in the Firebase environment.";
    }
    return "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}
