import type { ClinicData } from '@/types';

// This is a mock database. In a real application, you would use Firestore.
let clinicData: ClinicData = {
  name: 'Tranquil Wellness Spa',
  address: '123 Zen Garden, Serenity City, SC 12345',
  hours: 'Mon-Fri: 9am - 8pm, Sat: 10am - 6pm, Sun: Closed',
  phone: '555-0101',
  availableStaff: [
    { name: 'Dr. Evelyn Reed' },
    { name: 'Marco Jimenez (RMT)' },
    { name: 'Aisha Chen (Acupuncturist)' },
  ],
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
  return Promise.resolve(clinicData);
};

export const updateClinicData = async (data: ClinicData): Promise<ClinicData> => {
  // In a real app, this would update data in Firestore
  clinicData = data;
  return Promise.resolve(clinicData);
};
