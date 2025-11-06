
"use server";

import { answerClinicQuestions } from '@/ai/flows/answer-clinic-questions';
import { getClinicData } from '@/lib/data';

export async function submitMessage(message: string): Promise<string> {
  if (!message.trim()) {
    return "Please enter a question.";
  }

  try {
    const clinicData = await getClinicData();
    const faqString = clinicData.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
    
    // Create a combined object of staff and their schedules
    const staffAndSchedule = {
      staff: clinicData.staff,
      schedule: clinicData.weeklySchedule
    };

    const aiResponse = await answerClinicQuestions({
      question: message,
      clinicName: clinicData.name,
      clinicAddress: clinicData.address,
      clinicHours: clinicData.hours,
      clinicPhone: clinicData.phone,
      staffAndSchedule: JSON.stringify(staffAndSchedule, null, 2),
      faq: faqString,
    });
    
    return aiResponse.answer;
  } catch (error) {
    console.error("Error calling AI flow:", error);
    return "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}
