
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
  };

  try {
    const clinicResponse = await answerClinicQuestions({
      question: message,
      clinicName: clinicData.name,
      clinicAddress: clinicData.address,
      clinicHours: clinicData.hours,
      clinicPhone: clinicData.phone,
      staffAndSchedule: JSON.stringify(staffAndSchedule, null, 2),
      faq: faqString,
    });
    
    if (!clinicResponse.answer.includes("I cannot answer this")) {
        return clinicResponse.answer;
    }
  } catch (error: any) {
     if (error.message && error.message.includes('API key not valid')) {
       return "I'm sorry, my connection to the AI service isn't configured correctly. The API key is missing or invalid. Please follow the setup instructions to add the GEMINI_API_KEY to your project's secrets.";
     }
     console.warn("Clinic-specific AI flow failed, falling back to general model. Error:", error);
  }
  
  try {
    const generalResponse = await answerGeneralWellnessQuestion({ question: message });
    return generalResponse.answer;
  } catch (error: any) {
    console.error("Error calling general AI flow:", error);
    if (error.message && error.message.includes('API key not valid')) {
         return "I'm sorry, my connection to the AI service isn't configured correctly. The API key is missing or invalid. Please follow the setup instructions to add the GEMINI_API_KEY to your project's secrets.";
    }
    return "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}
