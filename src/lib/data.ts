import type { ClinicData, Booking } from '@/types';
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
  massageServices: [
    { id: 'svc1', name: 'Swedish Massage', duration: 60, price: 70 },
    { id: 'svc2', name: 'Deep Tissue Massage', duration: 60, price: 85 },
    { id: 'svc3', name: 'Hot Stone Massage', duration: 90, price: 120 },
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

let bookings: Booking[] = [];

export const getClinicData = async (): Promise<ClinicData> => {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(JSON.parse(JSON.stringify(clinicData)));
};

export const updateClinicData = async (data: ClinicData): Promise<ClinicData> => {
  // In a real app, this would update data in Firestore
  clinicData = JSON.parse(JSON.stringify(data));
  return Promise.resolve(clinicData);
};

export const getAvailableStaff = async (): Promise<{id: string, name: string }[]> => {
  const data = await getClinicData();
  const now = new Date();

  const busyStaffIds = new Set(
    data.sessions
      .map(session => {
        const service = data.massageServices.find(s => s.id === session.massageServiceId);
        if (!service) return null;

        const startTime = new Date(session.startTime);
        const endTime = addMinutes(startTime, service.duration);
        
        return {
          staffId: session.staffId,
          isBusy: isAfter(now, startTime) && isAfter(endTime, now)
        };
      })
      .filter(item => item?.isBusy)
      .map(item => item!.staffId)
  );

  return data.staff.filter(staff => !busyStaffIds.has(staff.id));
};

export const createBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
  const newBooking: Booking = {
    id: `booking-${Date.now()}-${Math.random()}`,
    ...booking
  };
  bookings.push(newBooking);
  return Promise.resolve(newBooking);
}

export const getBooking = async (id?: string, partialBooking?: Omit<Booking, 'id' | 'staffId'>): Promise<Booking[]> => {
  if (id) {
    const booking = bookings.find(b => b.id === id);
    return Promise.resolve(booking ? [booking] : []);
  }
  if(partialBooking) {
    return Promise.resolve(bookings.filter(b => b.name === partialBooking.name && b.bookingTime === partialBooking.bookingTime && b.massageServiceId === partialBooking.massageServiceId));
  }
  return Promise.resolve(bookings);
}
