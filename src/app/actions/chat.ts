
"use server";

import { answerClinicQuestions } from '@/ai/flows/answer-clinic-questions';
import { getClinicDataForClient, getAvailableStaffForClient } from './data';

export async function submitMessage(message: string): Promise<string> {
  if (!message.trim()) {
    return "Please enter a question.";
  }

  try {
    const clinicData = await getClinicDataForClient();
    // Pass `new Date()` to get staff available today specifically
    const availableStaff = await getAvailableStaffForClient(new Date());
    const faqString = clinicData.faq.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
    const staffString = availableStaff.map(s => s.name).join(', ');

    const aiResponse = await answerClinicQuestions({
      question: message,
      clinicName: clinicData.name,
      clinicAddress: clinicData.address,
      clinicHours: clinicData.hours,
      clinicPhone: clinicData.phone,
      availableStaff: staffString || "No one is scheduled to work today.",
      faq: faqString,
    });

    return aiResponse.answer;
  } catch (error) {
    console.error("Error calling AI flow:", error);
    return "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}
