
"use server";

import { answerClinicQuestions } from '@/ai/flows/answer-clinic-questions';
import { getClinicData } from '@/lib/data';
import { getDay } from 'date-fns';

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
    
    // Get the number of the current day, e.g., 4 for Thursday
    const todayDayNumber = getDay(new Date());

    const aiResponse = await answerClinicQuestions({
      question: message,
      clinicName: clinicData.name,
      clinicAddress: clinicData.address,
      clinicHours: clinicData.hours,
      clinicPhone: clinicData.phone,
      staffAndSchedule: JSON.stringify(staffAndSchedule, null, 2),
      todayDayNumber: todayDayNumber,
      faq: faqString,
    });

    return aiResponse.answer;
  } catch (error) {
    console.error("Error calling AI flow:", error);
    return "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}
