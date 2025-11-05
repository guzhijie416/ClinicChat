import type { ClinicData } from '@/types';
import { addMinutes, isAfter } from 'date-fns';

// This is a mock database. In a real application, you would use Firestore.
let clinicData: ClinicData = {
  name: 'Tranquil Wellness Spa',
  address: '123 Zen Garden, Serenity City, SC 12345',
  hours: 'Mon-Fri: 9am - 8pm, Sat: 10am - 6pm, Sun: Closed',
  phone: '555-0101',
  staff: [
    { id: '1', name: 'Dr. Evelyn Reed' },
    { id: '2', name: 'Marco Jimenez (RMT)' },
    { id: '3', name: 'Aisha Chen (Acupuncturist)' },
  ],
  sessions: [],
  faq: [
    { 
      question: 'Do you offer couple massages?', 
      answer: 'Yes, we have a dedicated suite for couple massages. Please book in advance to ensure availability.' 
    },
    { 
      question: 'What is your cancellation policy?', 
      answer: 'We require a 24-hour notice for any cancellations or rescheduling. A fee may apply for late cancellations.' 
    },
    {
      question: 'What is deep tissue massage?',
      answer: 'Deep tissue massage is a massage technique that\'s mainly used to treat musculoskeletal issues, such as strains and sports injuries. It involves applying sustained pressure using slow, deep strokes to target the inner layers of your muscles and connective tissues.'
    }
  ],
};

export const getClinicData = async (): Promise<ClinicData> => {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(JSON.parse(JSON.stringify(clinicData)));
};

export const updateClinicData = async (data: ClinicData): Promise<ClinicData> => {
  // In a real app, this would update data in Firestore
  clinicData = JSON.parse(JSON.stringify(data));
  return Promise.resolve(clinicData);
};

export const getAvailableStaff = async (): Promise<{ name: string }[]> => {
  const data = await getClinicData();
  const now = new Date();

  const busyStaffIds = new Set(
    data.sessions
      .filter(session => {
        const startTime = new Date(session.startTime);
        const endTime = addMinutes(startTime, session.duration);
        return isAfter(now, startTime) && isAfter(endTime, now);
      })
      .map(session => session.staffId)
  );

  return data.staff.filter(staff => !busyStaffIds.has(staff.id));
}