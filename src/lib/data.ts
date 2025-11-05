import type { ClinicData, Booking, Staff } from '@/types';
import { addMinutes, isAfter } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

// This is a mock database using a JSON file for persistence.
const DB_PATH = path.resolve(process.cwd(), 'db.json');

type Db = {
  clinicData: ClinicData;
  bookings: Booking[];
}

const defaultData: Db = {
  clinicData: {
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
  },
  bookings: []
};

async function readDb(): Promise<Db> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so write the default data and return it
      await fs.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    console.error("Failed to read database:", error);
    // Return default data as a fallback in case of other read errors
    return defaultData;
  }
}

async function writeDb(data: Db): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to write to database:", error);
    throw new Error("Could not write to the database.");
  }
}

export const getClinicData = async (): Promise<ClinicData> => {
  const db = await readDb();
  return db.clinicData;
};

export const updateClinicData = async (data: ClinicData): Promise<ClinicData> => {
  const db = await readDb();
  db.clinicData = data;
  await writeDb(db);
  return db.clinicData;
};

export const getAvailableStaff = async (): Promise<Staff[]> => {
  const data = await getClinicData();
  const now = new Date();

  const busyStaffIds = new Set(
    data.sessions
      .map(session => {
        const service = data.massageServices.find(s => s.id === session.massageServiceId);
        if (!service || !session.startTime) return null;

        try {
          const startTime = new Date(session.startTime);
          const endTime = addMinutes(startTime, service.duration);
          
          return {
            staffId: session.staffId,
            isBusy: isAfter(now, startTime) && isAfter(endTime, now)
          };
        } catch(e){
          return null;
        }
      })
      .filter(item => item?.isBusy)
      .map(item => item!.staffId)
  );

  return data.staff.filter(staff => !busyStaffIds.has(staff.id));
};

export const createBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
  const db = await readDb();
  const newBooking: Booking = {
    id: `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...booking
  };
  db.bookings.push(newBooking);
  await writeDb(db);
  return newBooking;
}

export const getBooking = async (id: string): Promise<Booking | undefined> => {
  const db = await readDb();
  return db.bookings.find(b => b.id === id);
}