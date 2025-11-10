import type { ClinicData, Booking, Staff, Session } from '@/types';
import { addMinutes, getDay, isAfter, parseISO, startOfToday } from 'date-fns';
import { initializeFirebase } from '@/firebase/client-only-init';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

const defaultData: Omit<ClinicData, 'id'> = {
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
      id: 'faq1',
      question: 'Do you offer couple massages?', 
      answer: 'Yes, we have a dedicated suite for couple massages. Please book in advance to ensure availability.' 
    },
    { 
      id: 'faq2',
      question: 'What is your cancellation policy?', 
      answer: 'We require a 24-hour notice for any cancellations or rescheduling. A fee may apply for late cancellations.' 
    },
    {
      id: 'faq3',
      question: 'What is deep tissue massage?',
      answer: 'Deep tissue massage is a massage technique that\'s mainly used to treat musculoskeletal issues, such as strains and sports injuries. It involves applying sustained pressure using slow, deep strokes to target the inner layers of your muscles and connective tissues.'
    }
  ],
  weeklySchedule: {
    '1': [1,2,3,4,5], // Evelyn works Mon-Fri
    '2': [1,2,3,4,5], // Marco works Mon-Fri
    '3': [6,0]       // Aisha works Sat, Sun
  }
};

const getDb = () => {
  const { firestore } = initializeFirebase();
  return firestore;
}

export const getClinicData = async (): Promise<ClinicData> => {
  const db = getDb();
  const clinicDocRef = doc(db, 'clinic', 'main');
  const clinicDocSnap = await getDoc(clinicDocRef);

  if (!clinicDocSnap.exists()) {
    console.log("No clinic data found, creating default data.");
    await setDoc(clinicDocRef, defaultData);
    return { id: 'main', ...defaultData };
  }

  return { id: clinicDocSnap.id, ...clinicDocSnap.data() } as ClinicData;
};

export const updateClinicData = async (data: Partial<ClinicData>): Promise<void> => {
  const db = getDb();
  const clinicDocRef = doc(db, 'clinic', 'main');
  
  const schedule = data.weeklySchedule || {};
  if (data.staff) {
    for (const staffMember of data.staff) {
      if (!schedule[staffMember.id]) {
        schedule[staffMember.id] = [];
      }
    }
  }
  
  const dataToUpdate = { ...data, weeklySchedule: schedule };
  await setDoc(clinicDocRef, dataToUpdate, { merge: true });
};

export const getScheduledStaffForDay = async (forDate: Date): Promise<Staff[]> => {
    const clinicData = await getClinicData();
    const dayOfWeek = getDay(forDate);

    if (!clinicData || !clinicData.staff || !clinicData.weeklySchedule) {
        console.error("Staff list or weekly schedule is missing or invalid in Firestore.");
        return [];
    }
    
    const staff = clinicData.staff;
    const weeklySchedule = clinicData.weeklySchedule;

    const scheduledStaff = staff.filter(staffMember => {
        const staffSchedule = weeklySchedule[staffMember.id];
        if (!Array.isArray(staffSchedule)) {
            return false;
        }
        return staffSchedule.map(String).includes(String(dayOfWeek));
    });

    return scheduledStaff;
};

export const getAvailableStaff = async (forDate?: Date): Promise<Staff[]> => {
  const aDate = forDate ? new Date(forDate) : new Date();
  
  const scheduledStaff = await getScheduledStaffForDay(aDate);
  const { sessions, massageServices } = await getClinicData();

  const busyStaffIds = new Set(
    (sessions || [])
      .filter(session => {
        const service = massageServices.find(s => s.id === session.massageServiceId);
        if (!service || !session.startTime) return false;

        try {
          const startTime = parseISO(session.startTime);
          const endTime = addMinutes(startTime, service.duration);
          return aDate >= startTime && aDate < endTime;
        } catch(e){
          console.error(`Invalid date format for session ${session.id}: ${session.startTime}`);
          return false;
        }
      })
      .map(session => session.staffId)
  );

  return scheduledStaff.filter(staffMember => !busyStaffIds.has(staffMember.id));
};

export const createBooking = async (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
  const db = getDb();
  const batch = writeBatch(db);

  // 1. Create a new booking document
  const newBookingRef = doc(collection(db, 'bookings'));
  const newBooking: Booking = {
    id: newBookingRef.id,
    ...bookingData,
  };
  batch.set(newBookingRef, newBooking);

  // 2. Create a corresponding session document
  const clinicData = await getClinicData();
  const updatedSessions = [
    ...(clinicData.sessions || []),
    {
      id: `session-${newBooking.id}`, // Link session to booking
      staffId: newBooking.staffId,
      massageServiceId: newBooking.massageServiceId,
      startTime: newBooking.bookingTime,
    }
  ];

  const clinicDocRef = doc(db, 'clinic', 'main');
  batch.update(clinicDocRef, { sessions: updatedSessions });
  
  // 3. Commit the batch
  await batch.commit();
  
  return newBooking;
}


export const getBooking = async (id: string): Promise<Booking | undefined> => {
  const db = getDb();
  const bookingDocRef = doc(db, 'bookings', id);
  const docSnap = await getDoc(bookingDocRef);

  if (!docSnap.exists()) {
    return undefined;
  }
  return { id: docSnap.id, ...docSnap.data() } as Booking;
}

export const getAllBookings = async (): Promise<Booking[]> => {
  const db = getDb();
  const bookingsCol = collection(db, 'bookings');
  
  // No date filtering, fetches all bookings.
  const bookingSnapshot = await getDocs(bookingsCol);
  
  const bookings = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  
  return bookings.sort((a, b) => {
    try {
      const timeA = parseISO(a.bookingTime).getTime();
      const timeB = parseISO(b.bookingTime).getTime();
      return timeA - timeB; // Sort ascending
    } catch (e) {
      return 0;
    }
  });
};

export const deleteBooking = async (id: string): Promise<{success: boolean}> => {
  const db = getDb();
  const batch = writeBatch(db);

  const bookingRef = doc(db, 'bookings', id);
  const booking = await getBooking(id); // We need the booking details to find the session

  if (!booking) {
    return { success: false };
  }

  // 1. Delete the booking document
  batch.delete(bookingRef);

  // 2. Remove the corresponding session from the clinic document
  const clinicData = await getClinicData();
  const updatedSessions = clinicData.sessions.filter(s => s.id !== `session-${id}`);
  const clinicDocRef = doc(db, 'clinic', 'main');
  batch.update(clinicDocRef, { sessions: updatedSessions });

  // 3. Commit the batch
  await batch.commit();

  return { success: true };
}